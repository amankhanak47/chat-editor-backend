const express = require("express");
const { body, validationResult } = require("express-validator");

const router = express.Router();

//route1 get all the notes using get api/auth/getuser login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occured");
  }
});

//rout2 add new notes using post api/auth/addnotes  login required
router.post(
  "/addnote",
  [
    body("title", "Enter a valid title").isLength({ min: 2 }),
    body("description", "enter a valid desc").isLength({ min: 3 }),
  ],
  fetchuser,
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = await new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savenote = await note.save();

      res.json(savenote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some  error occured");
    }
  }
);

//route3 update note post api api/note/updatenote


router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        // Create a newNote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})



//route3 delete node  using delete login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //find the note to be deleted
    let note = await Note.findById(req.params.id);
    if (!note) {
      res.status(404).send("not found");
    }
    if (note.user.toString() !== req.user.id) {
      //getting error😒  ??error solved😍
      return res.status(401).send("not alowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ sucess: "note has been deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some  error occured");
  }
});

module.exports = router;
