Overview: create a slideshow page create a photo gallery based on data that we receive from our API server that will allow us to like and favorite a photo comments for each photo will be rendered below the slideshow form will allow us to send new comments back via AJAX when the slideshow advances, the details of the photo and the comments are re-rendered to match the visible image

REQUIREMENTS:

Heading: name of photo owner

Photo: image left and right buttons ::clickable to view photos earlier and later in list photo description some way of tying photo with comments, favorites, info and likes

Info: name of photo data taken

Likes: heart button displays how many for the current photo ::clickable to add a like to the current photo displays new like immediately

Favorites: star button displays how many for the current photo ::clickable to add a favorite to the current photo displays new favorite immediately

Comments List: list of comments

Comment: user photo user name comment text date submitted

Comment Form: name email comment text ::submit button "Post Comment" to add comment to the comments list of that photo

APPROACH Each photo has to be tied in with a photo description, name of photo, the date it was taken and a list of its likes, favorites, comments each photo can be given an id, description, name of photo, the date it was taken on, number indicating likes, number inidacting favorites each comment can be saved with a photo id a photos comments list can be loaded each time with a search for the photo id in all comments

To get our data we can GET all photos, this means we can make one request when opening the page and create a Photo object from each of them and add them to a local storage variable. Display photo 1 from storage. Autofill sections: !!based on response body. Like and Favorite buttons are always displayed but must be submitted to the right photo_id. Update the UI AND the Comment object properties based off the like or favorite POST request body. We can also GET comments with id of photo as param, so when we display a photo, we make that request and populate a CommentsList object with newly created Comment objects. Then A CommentForm is always displayed, but must be submitted with the right photo_id.

DATA STRUCTURES:

Data will all be gathered from API, an HTML skeleton is only required name of photo album heading Henrys Cat Pics slideshow -slide with photo- -title- -caption- -date- like button -quantity- favorite button -quantity- comments heading Comments comments list -comment++- //#each handlebar? -name- -photo- -date- -comment- comment form heading Your Comment input Your Name input Your Email input Comment submit button Post Comment

sideshow: whole element set to position: relative, and each slide to position: absolute, to stack them set up HTML to have a slideshow element

requests: query params: url encode them and add to url in xhr.open OR fetch('https://example.com?' + new URLSearchParams({ foo: 'value',  bar: 2, }))

getting slides: const response = await fetch("http://localhost:3000/photos"); const jsonData = await response.json(); response: array of json data objects [{src: link to photo str, title: photo title str, caption: ... str, created_at: date string, favorites: num, id: num, likes: num}, {}, ...]

getting comments: const response = await fetch("http://localhost:3000/comments?" +  new URLSearchParams({photo_id: ID})); response: array of json data objects [{body: str, date: str, gravatar: img linkstr , name: str, photo_id: num}, ...]

updating likes/favorites: async function retrievePhotos() { const response = await fetch("http://localhost:3000/photos/like", { method: "POST", headers: { "Content-Type": "application/json", }, body: JSON.stringify({photo_id: ID}), });
const jsonData = await response.json(); console.log(jsonData); } response: {total: num}

submitting comment: async function submitComment() { const response = await fetch("http://localhost:3000/comments/new", { method: "POST", headers: { "Content-Type": "application/json", }, body: JSON.stringify({photo_id: 1, body: 'hey im body', name: 'jedd', email: 'stephen@gmail.com'}), });
const jsonData = await response.json(); console.log(jsonData); } response: {body: str, name: str, date: str, photo_id: num, gravatar: str}

ALGORITHM

init gallery

init view
retrieve all slides (fetch GET "http://localhost:3000/photos")
init Photos object with array response from server
display homepage('next')
get nextphoto from photos
send photoInfo to view V - fills slide handlebars with object
send statInfo to view V - fills stats handlebars with object
set currentID
show comments
retrieve comments for that photo, determined by ID (fetch GET "http://localhost:3000/comments?" + new URLSearchParams({photo_id: ID});)
send Comments to view V - fills handlebars with those comments
init view

OBJECTS gallery properties:

view
photos
currentID
methods: - init() this.new view photoslist = getAll() this.new photos(photoslist) displayPage('next') currentID;

- displayPage('next/previous')
  get photos.next/previous() `photo`
  send to view.renderPhoto(`photo.photoInfo`)
  send to view.renderStats(`photo.statsInfo`)
  set currentID
  set photos.comments = getComments()
  view.renderComments(comments)

- getComments()
  fetch returns comments for this.currentID

- getAll()
  fetch
  return json response

- incrementStatsHandler('like/favorite')
  newTotal = this.postStat('like/favorite')
  newStats = photos.updateLikeorFavorite('like/favorite' newTotal)
  view.renderStats(newStats)

- postStat('like/favortie')
  post fetch( url='likes/favorites', this.currentID)
  return json response

- submitCommentHandler(formData)
  newcomment = this.postComment(formData)
  allCommentts = this.photos.updateComments(newComments)
  iew.renderComments(comments)

- serialize(formData)
  return {photo_id: 1, body: 'hey im body', name: 'jedd', email: 'stephen@gmail.com'}

- postComment(formData)
  post fetch serialize(formData)
  return response
photos properties: - photo array - currentLocation = -1 - currentPhoto; - comments

methods: - init(photos) this.photoArray = photos currentLocation = -1 return this

- formatPhotoData() 
  this.curentPhoto => [photoInfo: {}, statsInfo:{}]

- switchPhoto()
  - next()
    increase current_location (loops)
    if (current_location === photoArray.length - 1)
      currentLocation = 0;
    else {
      currentLocation++;
    }
    currentPhoto = photoArray[currentLocation];
    returns this.formatPhotoData
  - previous()
    if (current_location === 0)
      currentLocation = this.photoArray.length
    decrease current_location (loops)
    currentPhoto = photoArray[currentLocation];
    returns this.formatPhotoData

- updateStat('like/favorite', newVallue)
  let newStats = currentPhoto[statsInfo]['like/favorite'] = newValue['total']
  return newStats

- updateComments(comment)
  this.comments += comment
  return comments

view properties: - gallery

methods
 - init(gallery) 
  - this.gallery return this
  - this.bindChangePhotoButton
  - this.bindSubmitComment

- renderPhoto(photo)
- renderStats(stats)
- renderComments(comments)

- bindAddStat
bind to #stats_area
  if .stat
  use id
  gallery.incrementStatHandler()

- bindChangePhoto
  bind to #slideshow 
  if (e.target.classList.contains(".change_photo")) {
    destination = e.target.id
    gallery.displayPage('destination')

- bind submit addComment form
  gallery.submitCommentHandler
  photos.updateComments
  view.renderComments