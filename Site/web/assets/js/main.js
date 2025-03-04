var ws = null
var headers = null

function notify(message) {
    var container = document.getElementById("notification-container");
    var notification = document.createElement("div");

    notification.classList.add("notification");
    notification.textContent = message;
    notification.style.backgroundColor = "#9370DB";

    container.appendChild(notification);

    setTimeout(() => { notification.remove() }, 1000 * 7);
}

function handleWebsocket() {
    if (ws && ws.readyState !== WebSocket.CLOSED) return;

    ws = new WebSocket("ws://localhost:8765");

    ws.onmessage = (event) => {
        try {
            var data = JSON.parse(event.data);

            if (data.type == "allLikesResponse") {
                headers = data.headers

                var parsedResponse = JSON.parse(data.body)

                loadLikes(parsedResponse)
            }

            if (data.type == "likeResponse") {
                if (!data.success) {
                    notify(`Failed to match/like ${data.displayName}`)
                } else {
                    notify(`Successfully matched with ${data.displayName}`, 1000 * 7)

                    var likedUserCard = document.querySelector(`.likes-user-card[data-id="${data.profileId}"]`);

                    if (likedUserCard) {
                        likedUserCard.remove();

                        var totalLikesElement = document.getElementById("totalLikes");
                        var currentTotalLikes = parseInt(totalLikesElement.textContent.split(" ")[0]);
                        totalLikesElement.textContent = `${(currentTotalLikes - 1).toLocaleString()} Total Likes`;
                    }
                }
            }

            if (data.type == "dislikeResponse") {
                if (!data.success) {
                    notify(`Failed to dislike ${data.displayName}`)
                } else {
                    notify(`Successfully disliked ${data.displayName}`)

                    var likedUserCard = document.querySelector(`.likes-user-card[data-id="${data.profileId}"]`);

                    if (likedUserCard) {
                        likedUserCard.remove();

                        var totalLikesElement = document.getElementById("totalLikes");
                        var currentTotalLikes = parseInt(totalLikesElement.textContent.split(" ")[0]);
                        totalLikesElement.textContent = `${(currentTotalLikes - 1).toLocaleString()} Total Likes`;
                    }
                }
            }
        } catch (error) {
            notify("Received unreadable data from the websocket")
        }
    };

    ws.onclose = () => {
        notify("The websocket was closed")
    };

    ws.onerror = (error) => {
        notify("The websocket received an error")
    };
}

document.addEventListener("DOMContentLoaded", () => {
    handleWebsocket()
});

function capitalizeFirstLetterWithSpaces(str) {
    return str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}

function loadLikes(data) {
    var likedBy = data["data"]["filteredWhoLikesMe"]["profiles"]["nodes"];
    var userGrid = document.getElementById("likesUserGrid");

    var totalLikes = document.getElementById("totalLikes")

    totalLikes.textContent = `${data["data"]["filteredWhoLikesMe"]["profiles"]["pageInfo"]["total"].toLocaleString()} Total Likes`;

    userGrid.innerHTML = "";

    likedBy.forEach(user => {
        var { age, gender, sexuality, imaginaryName, interactionStatus, photos, distance, id } = user;

        var userSection = document.createElement("div");
        userSection.classList.add("likes-user-card");
        userSection.setAttribute("data-id", id);

        userSection.innerHTML = `<h2>${imaginaryName || "Unknown"}</h2>
            <p>${age || "Unknown"} ${capitalizeFirstLetterWithSpaces(gender.toLowerCase().replaceAll("_", " ").replaceAll("-", "")) || "Unknown"} ${capitalizeFirstLetterWithSpaces(sexuality.toLowerCase().replaceAll("_", " ").replaceAll("-", "")) || "Unknown"}</p>
            <p>${distance["mi"] || "Unknown"} mi away</p>
        `;

        if (photos && photos.length > 0) {
            let currentIndex = 0;

            var photoContainer = document.createElement("div");
            photoContainer.style.position = "relative";
            photoContainer.style.textAlign = "center";

            var img = document.createElement("img");
            img.src = photos[currentIndex].pictureUrl;
            img.classList.add("likes-user-photo");
            img.style.maxWidth = "100%";
            img.style.borderRadius = "10px";
            photoContainer.appendChild(img);

            var backButton = document.createElement("button");
            backButton.textContent = "<";
            backButton.style.position = "absolute";
            backButton.style.left = "10px";
            backButton.style.top = "50%";
            backButton.style.transform = "translateY(-50%)";
            backButton.style.padding = "10px";
            backButton.style.background = "#42454a";
            backButton.style.color = "#fff";
            backButton.style.border = "none";
            backButton.style.cursor = "pointer";
            backButton.style.borderRadius = "5px";

            var nextButton = document.createElement("button");
            nextButton.textContent = ">";
            nextButton.style.position = "absolute";
            nextButton.style.right = "10px";
            nextButton.style.top = "50%";
            nextButton.style.transform = "translateY(-50%)";
            nextButton.style.padding = "10px";
            nextButton.style.background = "#42454a";
            nextButton.style.color = "#fff";
            nextButton.style.border = "none";
            nextButton.style.cursor = "pointer";
            nextButton.style.borderRadius = "5px";

            backButton.addEventListener("click", () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    img.src = photos[currentIndex].pictureUrl;
                }
            });

            nextButton.addEventListener("click", () => {
                if (currentIndex < photos.length - 1) {
                    currentIndex++;
                    img.src = photos[currentIndex].pictureUrl;
                }
            });

            photoContainer.appendChild(backButton);
            photoContainer.appendChild(nextButton);

            userSection.appendChild(photoContainer);

            var actionButtons = document.createElement("div");
            actionButtons.style.display = "flex";
            actionButtons.style.justifyContent = "space-between";
            actionButtons.style.marginTop = "10px";

            var plusButton = document.createElement("button");
            plusButton.textContent = "+";
            plusButton.setAttribute("alt", id);
            plusButton.style.padding = "8px 16px";
            plusButton.style.background = "#9370DB";
            plusButton.style.color = "#fff";
            plusButton.style.border = "none";
            plusButton.style.cursor = "pointer";
            plusButton.style.borderRadius = "5px";
            plusButton.style.fontSize = "14px";
            plusButton.onclick = () => matchUser(id, imaginaryName);

            var minusButton = document.createElement("button");
            minusButton.textContent = "-";
            minusButton.setAttribute("alt", id);
            minusButton.style.padding = "8px 16px";
            minusButton.style.background = "#9370DB";
            minusButton.style.color = "#fff";
            minusButton.style.border = "none";
            minusButton.style.cursor = "pointer";
            minusButton.style.borderRadius = "5px";
            minusButton.style.fontSize = "14px";
            minusButton.onclick = () => dislikeUser(id, imaginaryName);

            actionButtons.appendChild(plusButton);
            actionButtons.appendChild(minusButton);

            userSection.appendChild(actionButtons);
        } else {
            userSection.innerHTML += `<p>No photos (this should never happen)</p>`;
        }

        userGrid.appendChild(userSection);
    });
}

function matchUser(profileId, displayName) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: "like",
            headers: headers,
            profileId: profileId,
            displayName: displayName
        }));
    } else {
        notify("Not connected to socket, refresh and try again...");
    }
}

function dislikeUser(profileId, displayName) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: "dislike",
            headers: headers,
            profileId: profileId,
            displayName: displayName
        }));
    } else {
        notify("Not connected to socket, refresh and try again...");
    }
}