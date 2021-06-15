const server = require('express')
const router = server.Router()
const bcrypt = require('bcryptjs')
const User = require('../users/users-model')
const {checkUsernameFree, checkUsernameExists} = require('./auth-middleware')
// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */

router.post(
	'/register',
	checkUsernameFree,
	checkUsernameExists,
	async (req, res, next) => {
		try {
			const {username, password} = req.body
			const hash = bcrypt.hashSync(password, 8)
			const newUserObj = {username, password: hash}
			const newUserId = await User.add(newUserObj)
			const foundNewUser = await User.findById(newUserId)
			res.status(201).json(foundNewUser)
		} catch (error) {
			next(error)
		}
	}
)
0
/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

router.post('/login', async (req, res, next) => {
	try {
		const {username, password} = req.body
		const [user] = await User.findBy({username})

		if (user && bcrypt.compareSync(password, user.password)) {
			req.session.user = user
			res.status(200).json({messgage: `welcome ${username}`})
		} else {
			next({status: 401, message: 'invalid credentials'})
		}
	} catch (error) {
		next(error)
	}
})

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
router.get('/logout', (req, res, next) => {
	if (req.session.user) {
		req.session.destroy((err) => {
			if (err) res.json({message: 'session cannot be cancel'})
			else res.json({message: 'Good Bye'})
		})
	} else {
		res.status(200).json({message: 'Invalid Login'})
	}
})

module.exports = router
