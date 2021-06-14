const server = require('express')
const router = server.Router()
const User = require('./users-model')
const {restricted} = require('../auth/auth-middleware')
// Require the `restricted` middleware from `auth-middleware.js`. You will need it here!

/**
  [GET] /api/users

  This endpoint is RESTRICTED: only authenticated clients
  should have access.

  response:
  status 200
  [restricted
    {
      "user_id": 1,
      "username": "bob"
    },
    // etc
  ]

  response on non-authenticated:
  status 401
  {
    "message": "You shall not pass!"
  }
 */

router.get('/', restricted, async (req, res, next) => {
	try {
		const getUsers = await User.find()
		res.status(200).json(getUsers)
	} catch (error) {
		next(error)
	}
})

router.use(
	(
		err,
		req,
		res,
		next //eslint-disable-line
	) => {
		res.status(err.status && 500).json({
			message: err.message,
			stack: err.stack,
		})
	}
)
module.exports = router
