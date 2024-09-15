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
        if (event.target.classList.contains("saved-news")) {
            const card = event.target.closest(".card");
            const newsData = extractNewsData(card);
            saveNews(newsData);
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
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = article.urlToImage || "https://via.placeholder.com/400x200"; 
    newsTitle.textContent = article.title;
    newsDesc.textContent = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
    });

    newsSource.textContent = `${article.source.name}. ${date}`;
}

function extractNewsData(card) {
    const email = localStorage.getItem("email");
    if (!email) {
        alert("User email not found. Please log in.");
        return null;
    }

    const title = card.querySelector("#news-title").textContent;
    const img = card.querySelector("#news-img").src;
    const source = card.querySelector("#news-source").textContent;
    const desc = card.querySelector("#news-desc").textContent;

    return { email, title, img, source, desc };
}

function saved() {
    const card = event.target.closest(".card");
    if (card) {
        const email = localStorage.getItem("email");
        const newsTitle = card.querySelector("#news-title").innerText;
        fetch(`http://localhost:8080/The_Noble_News/NewsServlet?email=${email}`)
                .then(response => response.json())
                .then(savedNewsList => {
                    const isNewsSaved = savedNewsList.some(news => news.title === newsTitle);

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
}

const Mode = document.getElementById("mode");
Mode.addEventListener("click", function () {
    if (Mode.classList.contains("fa-sun")) {
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
});

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