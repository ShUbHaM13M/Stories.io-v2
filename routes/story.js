const express = require('express')
const Story = require('../controller/story')

const router = express.Router()

router.get('/', Story.getStories)
router.get('/:slug', Story.getStoryBySlug)
router.post('/', Story.newStory)
router.put('/:id/edit', Story.editStory)
router.delete('/:id/delete', Story.deleteStory)
router.post('/:slug/like', Story.like)
router.post('/:slug/add-comment', Story.addComment)
router.get('/:slug/remove-comment', Story.removeComment)
router.get('/:slug/get-comments', Story.getComments)

module.exports = router