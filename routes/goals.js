const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");

const Goal = require("../models/Goal");

// @desc    Show add page
// @route   GET /goals/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("goals/add")
})

// @desc    Process add form
// @route   POST /goals
router.post("/", ensureAuth, async (req, res) => {
  try {
      req.body.user = req.user.id
      await Goal.create(req.body)
      res.redirect('/dashboard')
  } catch (error) {
      console.error(error)
      res.render('error/500')
  }
})


// @desc    Show all completed goals
// @route   GET /goals/add
router.get("/", ensureAuth, async (req, res) => {
    try {
        const goals = await Goal.find({ status: 'Completed',
                                      user: req.user.id})
          .populate('user')
          .sort({ createdAt: 'desc'})
          .lean()

        res.render('goals/index', {
          goals,
        })
    } catch (error) {
        console.error(error);
        res.render('error/500')
    }
})


// @desc    Show edit page
// @route   GET /goals/add
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
    }).lean();

    if (!goal) {
      return res.render("error/404");
    }

    if (goal.user != req.user.id) {
      res.redirect("/goals");
    } else {
      res.render("goals/edit", { goal });
    }
  } catch (error) {
    console.error(error);
    res.render("error/404");
  }
  
})


// @desc    Show edit page
// @route   GET /goals/add
router.get("/work/:id", ensureAuth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
    }).lean();

    // ALGORITHSM GO HERE
    // CHART.JS
    // WORK DASHBOARD

    if (!goal) {
      return res.render("error/404");
    }

    if (goal.user != req.user.id) {
      res.redirect("/goals");
    } else {
      res.render("goals/work", { goal });
    }
  } catch (error) {
    console.error(error);
    res.render("error/404");
  }
  
})


// @desc    update goal
// @route   PUT /goals/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id).lean();

    if (!goal) {
      return res.render("error/404");
    }

    if (goal.user != req.user.id) {
      res.redirect("/goals");
    } else {
      goal = await Goal.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.redirect("/dashboard");
    }
  } catch (error) {
    console.error(error);
    return res.render("error/500");
  }
})

// @desc    Delete goal
// @route   DELETE /goals/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id).lean()
    
    if (!goal) {
      return res.render("error/404");
    }

    if (goal.user != req.user.id) {
      res.redirect("/goals");
    } else {
      await Goal.remove({ _id: req.params.id });
      res.redirect("/dashboard");
    }
  
  } catch (error) {
    console.error(error)
    return res.render('error/500')
  }
})


// @desc    Show single story
// @route   GET /goals/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id).populate('user').lean()

    if (!goal) {
      return res.render('error/404')
    }

    if (goal.user._id != req.user.id) {
      res.render("error/404");
    } else {
      res.render("goals/show", {
        goal,
      });
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})


// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.params.userId,
      status: ["Not-started","In-view"],
    })
      .populate("user")
      .lean();

    res.render("goals/index", {
      goals,
    });
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})



module.exports = router;
