(function (apiUrl) {
  /*
   The function gets a user from the API and sets the username and user avatar
   */
  function getMe() {
    return fetch(apiUrl + "/me")
      .then(function (response) {
        return response.json();
      })
      .then(function (user) {
        const username = document.getElementById("current-user-username");
        const avatar = document.getElementById("current-user-avatar");

        username.innerHTML = user.username;

        if (user.avatar) {
          avatar.style.backgroundImage = "url('" + user.avatar + "')";
        }

        getPost(user.username);
      });
  }
  /*
    The function getPost recive a user name as parameter
    set the post img, post owner information, post comments and post information
   */
  function getPost(username) {
    return fetch(apiUrl + "/post?username=" + username)
      .then(function (response) {
        if (response.ok) return response.json();
        else window.alert("Usuário não encontrado.");
      })
      .then(function (post) {
        //settint post owner information
        const post_image = document.getElementById("main-post-image");
        post_image.style.backgroundImage = "url('" + post.photo + "')";

        const avatar = document.getElementById("post-owner-avatar");
        if (post.user.avatar)
          avatar.style.backgroundImage = "url('" + post.user.avatar + "')";

        const username = document.getElementById("post-owner-username");
        username.innerHTML = post.user.username;

        const location = document.getElementById("post-owner-location");
        location.innerHTML = post.location.city + ", " + post.location.country;

        //setting all the comments
        for (let i = 0; i < post.comments.length; i++) {
          createComment(post.comments[i]);
        }
        //setting post information
        const comment_number = document.getElementById("post-comment-number");
        comment_number.innerHTML = post.comments.length + " comentários";

        const created_at = document.getElementById("post-date");
        created_at.innerHTML = post.created_at;

        //setting the other posts
        getOtherPosts(post.uuid);
      });
  }
  /**
  The function getOtherPosts recive a post uuid as parameter to
  set the other posts with at least 3 commnents 
 */
  function getOtherPosts(post_uuid) {
    return fetch(apiUrl + "/posts/" + post_uuid + "/related")
      .then(function (response) {
        if (response.ok) return response.json();
        else window.alert("Publicação não encontrada.");
      })
      .then(function (otherPosts_array) {
        const otherPosts_container = document.getElementById(
          "other-posts-container"
        );

        for (let i = 0; i < otherPosts_array.length; i++) {
          if (otherPosts_array[i].comment_count >= 3) {
            let img = document.createElement("img");
            img.src = otherPosts_array[1].photo;
            img.className = "other-posts__image";
            otherPosts_container.appendChild(img);
          }
        }
      });
  }
  /*
 The function like recive the comment uuid, that whos liked, to
 change the like counting in the APi
 returning the promisse with the updated comment
 */
  function like(commentUUID) {
    return fetch(apiUrl + "/comments/" + commentUUID.uuid + "/like", {
      method: "POST",
      body: JSON.stringify({ username: "Amanda_Weber" }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }
  /*
 The function unlike recive the comment uuid, that whos unliked, to
 change the like counting in the APi
 returning the promisse with the updated comment
 */
  function unlike(commentUUID) {
    return fetch(apiUrl + "/comments/" + commentUUID.uuid + "/unlike", {
      method: "POST",
      body: JSON.stringify({ username: "Amanda_Weber" }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  /*
   The function createComment recives a comment as parameter to
   create the comment HTML structure and set it's informations 
   and the like/unlike functionality
  */
  function createComment(comment) {
    const comment_section = document.getElementById("current-post-comments");

    const comment_div = document.createElement("div");
    comment_div.className = "comment";

    const avatar = document.createElement("div");
    avatar.className = "comment__avatar";
    if (comment.user.avatar)
      avatar.style.backgroundImage = "url('" + comment.user.avatar + "')";

    const username = document.createElement("p");
    username.className = "comment__user-name";
    username.innerHTML = comment.user.username;

    const message = document.createElement("spam");
    message.className = "comment__message";
    message.innerHTML = comment.message;

    username.appendChild(message);

    const user_message = document.createElement("div");
    user_message.className = "comment__username-message";
    user_message.appendChild(username);

    const time = document.createElement("div");
    time.className = "comment__time";
    time.innerHTML = calcCommentTime(comment.created_at);

    const like_count = document.createElement("div");
    like_count.className = "comment__like-count";
    if (comment.like_count > 0)
      like_count.innerHTML = comment.like_count + "curtidas";

    const has_liked = document.createElement("img");
    has_liked.className = "comment__like-btn";

    //like/unlike functionality
    has_liked.onclick = function () {
      if (comment.has_liked) {
        unlike(comment)
          .then(function (response) {
            if (response.ok) {
              has_liked.src = "imgs/notLiked.svg";
              return response.json();
            } else window.alert("Não foi possivel descurtir comentário, tente novamente.");
          })
          .then(function (comment_refreshed) {
            // refresh only if the request was successefull
            if (comment_refreshed !== undefined) {
              comment = comment_refreshed;
              //refresh the like counting display
              if (comment.like_count > 0)
                like_count.innerHTML = comment.like_count + "curtidas";
              else like_count.innerHTML = "";
            }
          });
      } else {
        like(comment)
          .then(function (response) {
            if (response.ok) {
              has_liked.src = "imgs/liked.svg";
              return response.json();
            } else window.alert("Não foi possivel curtir comentário, tente novamente.");
          })
          .then(function (comment_refreshed) {
            if (comment_refreshed !== undefined) {
              // refresh only if the request was successefull
              comment = comment_refreshed;
              //refresh the like counting display
              like_count.innerHTML = comment.like_count + "curtidas";
            }
          });
      }
    };

    if (comment.has_liked) has_liked.src = "imgs/liked.svg";
    else has_liked.src = "imgs/notLiked.svg";

    comment_div.appendChild(avatar);
    comment_div.appendChild(user_message);
    comment_div.appendChild(time);
    comment_div.appendChild(like_count);
    comment_div.appendChild(has_liked);

    comment_section.appendChild(comment_div);
  }

  function initialize() {
    getMe();
  }

  initialize();
})("https://taggram.herokuapp.com");

/*
  The function calcCommentTime recives a date as paramenter in the format 'yyyy-mm-dd-hh-mm-ss'
  and returns how much time has passed since the informed date
  the formatation will prioritise longer periods of time  - ex: if it has been one year and 10 days will return 1y
*/
function calcCommentTime(commnetDate) {
  const dataNow = new Date();
  const commentDate_Array = [
    commnetDate.substring(0, 4), //year
    commnetDate.substring(5, 7), //moth
    commnetDate.substring(8, 10), //day
    commnetDate.substring(11, 13), //hours
    commnetDate.substring(14, 16), //min
    commnetDate.substring(17, 19), //sec
  ];
  let timeResult = 0;
  if (commentDate_Array[1] === "") return commnetDate; // checking if came in formated
  if (dataNow.getUTCFullYear() !== Number(commentDate_Array[0]))
    timeResult = dataNow.getUTCFullYear() - commentDate_Array[0] + "y";
  else if (dataNow.getUTCMonth() + 1 !== Number(commentDate_Array[1]))
    timeResult = dataNow.getUTCMonth() - commentDate_Array[1] + "months";
  else if (dataNow.getUTCDate() !== Number(commentDate_Array[2]))
    timeResult = dataNow.getUTCDate() - commentDate_Array[2] + "d";
  else if (dataNow.getUTCHours() !== Number(commentDate_Array[3]))
    timeResult = dataNow.getUTCHours() - commentDate_Array[3] + "h";
  else if (dataNow.getUTCMinutes() !== Number(commentDate_Array[4]))
    timeResult = dataNow.getUTCMinutes() - Number(commentDate_Array[4]) + "m";
  else if (dataNow.getUTCSeconds() !== Number(commentDate_Array[5]))
    timeResult = dataNow.getUTCSeconds() - commentDate_Array[5] + "s";

  return timeResult;
}
