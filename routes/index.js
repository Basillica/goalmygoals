const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require("../middleware/auth");

const Goal = require('../models/Goal')

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  })
})

// @desc    Dashboard
// @route   GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id}).lean()
        res.render("dashboard", {
          name: req.user.firstName,
          goals,
          length: goals.length
        })
        //console.log(goals)
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})


module.exports = router