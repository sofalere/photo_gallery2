class View {
  constructor(gallery) {
    this.gallery = gallery;
    return this;
  }

  renderPhoto(photo) {
    const template = document.querySelector('#slide').innerHTML;
    const tempScript = Handlebars.compile(template);
    const html = tempScript(photo);
    document.querySelector('#slideshow').innerHTML = html;
  }

  renderStats(stats) {
    const template = document.querySelector('#stats').innerHTML;
    const tempScript = Handlebars.compile(template);
    const html = tempScript(stats);
    document.querySelector('#stats_area').innerHTML = html;
  }

  renderComments(comments) {
    const commentData = {commentList: [comments]};
    document.querySelector('#comment').innerHTML;
    const tempScript = Handlebars.compile(template);
    const html = tempScript(stats);
    document.querySelector('#comment_list').innerHTML = html;
  }

  bindChangePhoto() {
    document.querySelector('#slideshow').addEventListener('click', e => {
      if (e.target.classList.contains(".change_photo")) {
        const destination = e.target.id;
        this.gallery.displayPage(destination);
      }
    });
  }
}

class Photos {
  constructor(photoList) {
    this.photoList = photoList;
    this.currentLocation = -1;
    this.currentPhoto = null;
    this.comments = null;
    return this;
  }

  switchPhoto(direction) {
    if (direction === 'next') {
      this.current_location = (this.current_location === this.photoList.length - 1) ? 0 : this.currentLocation += 1;
      // if (this.currentLocation === this.photoList.length - 1)
      //   this.currentLocation = 0;
      // else {
      //   this.currentLocation++;
      // }
    } else if (direction === 'prev') {
      this.current_location = (this.current_location === 0) ? this.photoArray.length - 1 : this.currentLocation -= 1;
      // if (this.current_location === 0) {
      //   this.currentLocation = this.photoArray.length - 1;
      // } else {
      //   this.currentLocation -= 1;
      // }
    }

    const photo = this.photoList[this.currentLocation];
    this.currentPhoto = this.formatPhotoData(photo)
    console.log(this.currentPhoto)
    return this.currentPhoto;
  }

  formatPhotoData(photo) {
    return { photoInfo:  { caption: photo.caption,
                          src: photo.src,
                          created_at: photo.created_at,
                          photo_id: photo.id,
                          title: photo.title,
                         }, 
              statsInfo: { likes: photo.likes,
                           favorites: photo.favorites,
                         }
           };
  }
}

class Gallery {
  constructor() {
    this.view = new View(this);
    this.currentID = null;
    this.getAll((photoList) => {
      const photos = new Photos(photoList);
      this.photos = photos;
      this.displayPage('next');
    }).bind(this);
  }

  displayPage(direction) {
    let photo = this.photos.switchPhoto(direction);
    this.view.renderPhoto(photo.photoInfo);
    this.view.renderStats(photo.statsInfo);
    this.currentID = photo.photoInfo.photo_id;
    this.getComments((comments) => {
      this.photos.comments = comments;
      this.view.renderComments(comments);
    }).bind(this);
  }

  getAll = async function getAll(resolve, reject) {
    try {
      const response = await fetch("http://localhost:3000/photos");       
      const jsonData = await response.json();
      resolve(jsonData);
    } catch(error) {
      console.log(error);
    }
  }

  getComments = async function getComments(resolve, reject) {
    try {
      const response = await fetch("http://localhost:3000/comments?" + new URLSearchParams({photo_id: this.currentID}));

      const jsonData = await response.json();
      console.log(jsonData);
      resolve(jsonData);
    } catch(error) {
      console.log(error);
    }
  }
}


document.addEventListener("DOMContentLoaded", e => {
  new Gallery();
});

// async function updateLikes() {
//   const response = await fetch("http://localhost:3000/photos/like", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({photo_id: 2}),
//     });       
//   const jsonData = await response.json();
//   return jsonData;
// }

// async function submitComment() {
//   const response = await fetch("http://localhost:3000/comments/new", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({photo_id: 1, body: 'hey im body', name: 'jedd', email: 'stephen@gmail.com'}),
//     });       
//   const jsonData = await response.json();
//   return jsonData;
// }
