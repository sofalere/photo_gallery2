class View {
  constructor(gallery) {
    this.gallery = gallery;
    this.bindChangePhoto();
    this.bindAddStat();
    this.bindSubmitComment();
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
    if (!Array.isArray(comments)) {
      comments = [comments];
    }
    const commentData = {commentList: comments};
    const template = document.querySelector('#comment').innerHTML;
    const tempScript = Handlebars.compile(template);
    const html = tempScript(commentData);
    document.querySelector('#comment_list').innerHTML = html;
  }

  bindChangePhoto() {
    document.querySelector('#slideshow').addEventListener('click', e => {
      e.preventDefault();
      if (e.target.classList.contains("change_photo")) {
        const destination = e.target.id;
        this.gallery.displayPage(destination);
      }
    });
  }

  bindAddStat() {
    document.querySelector('#stats_area').addEventListener('click', e => {
      e.preventDefault();
      if (e.target.classList.contains("stat")) {
        const stat = e.target.id;
        this.gallery.incrementStatHandler(stat);
      }
    });    
  }

  bindSubmitComment() {
    document.querySelector('.comment_form').addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      this.gallery.submitCommentHandler(data);
    });
  }

  resetCommentForm() {
    document.querySelector('.comment_form').reset();
  }

  displayError() {
    alert('There was an error processing this request.');
    this.resetCommentForm();
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
      if (this.currentLocation === this.photoList.length - 1)
        this.currentLocation = 0;
      else {
        this.currentLocation++;
      }
    } else if (direction === 'prev') {
      if (this.currentLocation === 0) {
        this.currentLocation = this.photoList.length - 1;
      } else {
        this.currentLocation -= 1;
      }
    }

    const photo = this.photoList[this.currentLocation];
    this.currentPhoto = this.formatPhotoData(photo);
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

  updateStat(stat, newTotal) {
    this.currentPhoto.statsInfo[stat] = newTotal['total'];
    return this.currentPhoto.statsInfo;
  }

  updateComments(comment) {
    this.comments.push(comment);
    return this.comments;
  }
}

class Gallery {
  constructor() {
    this.view = new View(this);
    this.currentID = null;
    this.getAll(((photoList) => {
      const photos = new Photos(photoList);
      this.photos = photos;
      this.displayPage('next');
    }).bind(this));
  }

  displayPage(direction) {
    let photo = this.photos.switchPhoto(direction);
    this.view.renderPhoto(photo.photoInfo);
    this.view.renderStats(photo.statsInfo);
    this.currentID = photo.photoInfo.photo_id;
    this.getComments(((comments) => {
      this.photos.comments = comments;
      this.view.renderComments(comments);
    }).bind(this), this.reject.bind(this));
  }

  sendRequest = async function(path, resolve, options) {
    try {
      const response = await fetch("http://localhost:3000/" + path, options);       
      const jsonData = await response.json();
      resolve(jsonData);
    } catch(error) {
      this.reject(error);
    }
  }

  getAll(resolve) {
    this.sendRequest("photos", resolve)
  }

  getComments(resolve) {
    const path = "comments?" + new URLSearchParams({photo_id: this.currentID});
    this.sendRequest(path, resolve)
  }

  postStat(stat, resolve) {
    const path = "photos/" + stat.slice(0, -1);
    const options = { method: "POST", 
                      headers: { "Content-Type": "application/json", }, 
                      body: JSON.stringify({photo_id: this.currentID}),
                   };
    this.sendRequest(path, resolve, options);
  }

  postComment(comment, resolve) {
    comment = this.formatCommentData(comment);
    const options = { method: "POST", 
                      headers: { "Content-Type": "application/json", }, 
                      body: JSON.stringify(comment),
                    };
    this.sendRequest("comments/new", resolve, options)
  }

  incrementStatHandler(stat) {
    this.postStat(stat, ((newTotal) => {
      const newStats = this.photos.updateStat(stat, newTotal);
      this.view.renderStats(newStats);
    }).bind(this));
  }

  formatCommentData(data) {
    const result = {photo_id: this.currentID};
    for(let [k,v] of data.entries()) {
      result[k] = v;
    }
    return result;
  }

  submitCommentHandler(data) {
    this.postComment(data, ((comment) => {
      const comments = this.photos.updateComments(comment);
      this.view.renderComments(comments);
      this.view.resetCommentForm();
    }).bind(this));
  }

  reject(error) {
    this.view.displayError();
  }
}

document.addEventListener("DOMContentLoaded", e => {
  new Gallery();
});