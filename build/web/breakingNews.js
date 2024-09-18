/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */
document.addEventListener("DOMContentLoaded", () => {
    const breakingNews = JSON.parse(localStorage.getItem("breakingNews"));
    if (breakingNews) {
        displayBreakingNews(breakingNews);
    } else {
        console.error("No breaking news found in local storage.");
    }

    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.addEventListener("click", function (event) {
        const card = event.target.closest(".card");
        if (card) {
            const newsUrl = card.querySelector("#news-img").dataset.url;

            if (event.target.matches("#news-img, #news-title, #news-desc, #news-source")) {
                window.open(newsUrl, "_blank");
            }

            if (event.target.classList.contains("fa-copy")) {
                copyToClipboard(newsUrl);
                showNotification("News URL copied to clipboard!");
            }

            if (event.target.classList.contains("saved-news")) {
                saveNews(card);
            }
        }
    });
});

function displayBreakingNews(news) {
    const template = document.getElementById("template-news-card");
    const container = document.getElementById("cards-container");
    container.innerHTML = "";

    if (news.latest) {
        const cardClone = template.content.cloneNode(true);
        fillDataInCard(cardClone, news.latest);
        container.appendChild(cardClone);
    }

    if (news.old && news.old.length > 0) {
        news.old.forEach(article => {
            const cardClone = template.content.cloneNode(true);
            fillDataInCard(cardClone, article);
            container.appendChild(cardClone);
        });
    }
}

function fillDataInCard(cardClone, article) {
    const email = localStorage.getItem("email");
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");
    const newsUrl = article.url;
    newsImg.src = article.urlToImage || "https://via.placeholder.com/400x200";
    newsImg.dataset.url = newsUrl;

    newsTitle.textContent = article.title;
    newsDesc.textContent = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
    });

    newsSource.textContent = `${article.source.name}. ${date}`;
    history(email, article.title, article.url, article.urlToImage, newsSource.innerHTML, article.description);
}

function copyToClipboard(url) {
    navigator.clipboard.writeText(url)
            .then(() => {
                console.log("URL copied to clipboard!");
            })
            .catch(err => {
                console.error("Failed to copy URL: ", err);
            });
}

function saveNews(card) {
    const email = localStorage.getItem("email");
    const newsTitle = card.querySelector("#news-title").innerText;
    const newsUrl = card.querySelector("#news-img").dataset.url;

    fetch(`http://localhost:8080/The_Noble_News/NewsServlet?email=${email}`)
            .then(response => response.json())
            .then(savedNewsList => {
                const isNewsSaved = savedNewsList.some(news => news.title === newsTitle && news.url === newsUrl);
                if (isNewsSaved) {
                    showNotification("News is already saved!");
                } else {
                    const newsImg = card.querySelector("#news-img").src;
                    const newsSource = card.querySelector("#news-source").innerText;
                    const newsDesc = card.querySelector("#news-desc").innerText;

                    const newsData = {
                        email: email,
                        img: newsImg,
                        title: newsTitle,
                        url: newsUrl,
                        source: newsSource,
                        desc: newsDesc
                    };

                    fetch(`http://localhost:8080/The_Noble_News/NewsServlet?email=${email}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(newsData)
                    })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    showNotification("News saved successfully!");
                                } else {
                                    showNotification("Failed to save news.");
                                }
                            })
                            .catch(error => {
                                console.error("Error saving news:", error);
                                showNotification("An error occurred while saving news.");
                            });
                }
            })
            .catch(error => {
                console.error("Error checking saved news:", error);
            });
}

const Mode = document.getElementById("mode");
Mode.addEventListener("click", function () {
    if (Mode.classList.contains("fa-sun")) {
        localStorage.setItem("Mode", true);
        change(true);
    } else {
        localStorage.setItem("Mode", false);
        change(false);
    }
});

function change(element) {
    if (element === "true") {
        Mode.classList.remove("fa-sun");
        Mode.classList.add("fa-moon");
        document.querySelector("body").style.backgroundColor = "#454545";
        let cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.backgroundColor = '#454545';
        });
        let titles = document.querySelectorAll("#news-title");
        let descs = document.querySelectorAll(".news-desc");
        changeColor([...titles, ...descs], 'white');
    } else {
        Mode.classList.remove("fa-moon");
        Mode.classList.add("fa-sun");
        document.querySelector("body").style.backgroundColor = "#f0f0f0";
        let cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.backgroundColor = '#fff';
        });
        let titles = document.querySelectorAll("#news-title");
        let descs = document.querySelectorAll(".news-desc");
        changeColor([...titles, ...descs], 'black');
    }
}

function changeColor(elements, color) {
    elements.forEach(element => {
        element.style.color = color;
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function shareOnWhatsApp() {
    const newsTitle = document.getElementById('news-title').innerText;
    const newsUrl = window.location.href;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(newsTitle)} - ${encodeURIComponent(newsUrl)}`;
    window.open(whatsappUrl, '_blank');
}

function shareOnFacebook() {
    const newsTitle = document.getElementById('news-title').innerText;
    const newsUrl = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(newsUrl)}&quote=${encodeURIComponent(newsTitle)}`;
    window.open(facebookUrl, '_blank');
}

function shareOnTwitter() {
    const newsTitle = document.getElementById('news-title').innerText;
    const newsUrl = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(newsTitle)}&url=${encodeURIComponent(newsUrl)}`;
    window.open(twitterUrl, '_blank');
}

function Comments(commentIcon) {
    const card = commentIcon.closest('.card');
    const imgSrc = card.querySelector('#news-img').src;
    const title = card.querySelector('#news-title').textContent;
    const source = card.querySelector('#news-source').textContent;
    const description = card.querySelector('#news-desc').textContent;
    const url = card.querySelector("#news-img").dataset.url;
    const email = localStorage.getItem('email');
    const commentPageData = {
        imgSrc: imgSrc,
        title: title,
        source: source,
        description: description,
        url: url,
        email: email
    };
    localStorage.setItem('commentPageData', JSON.stringify(commentPageData));
    window.location.href = 'Comments.html';
}

function history(element1, element2, element3, element4, element5, element6) {
    fetch(`http://localhost:8080/The_Noble_News/HistoryServlet?email=${element1}&title=${encodeURIComponent(element2)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
            .then(response => response.json())
            .then(data => {
                if (!data.exists) {
                    fetch('http://localhost:8080/The_Noble_News/HistoryServlet', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: element1,
                            title: element2,
                            url: element3,
                            imageUrl: element4,
                            source: element5,
                            description: element6
                        })
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
}

document.addEventListener("DOMContentLoaded", () => {
    const mode = localStorage.getItem("Mode");
    if (mode === "true") {
        change(true);
    } else {
        change(false);
    }
});