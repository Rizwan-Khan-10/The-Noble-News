/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */
const API_KEYS = [
    "f9b31e7e03994c71a0a0a4cdac82140b",
    "1d3a0eefa97b499d8fbc4ee93eeb40b7",
    "fc13df432efb4abda1c728697a00e1a5",
    "91aaee9981a34dad8131f4d362211b1b",
    "b0125ce3f7e846a9975b33a0afbb86b3",
    "ee9cfd62ae2446fb96eb2b80f0b75978",
    "2f7d23dcebc4491084dbd44f1865f279",
    "0f82a17ac9c94c08baf188971ea3503e",
    "003fcba830d6433da53d89ba63f3007f",
    "52107240e16f4def9d91edbec4f17e78"
];
let currentApiKeyIndex = 0;
const url = "https://newsapi.org/v2/everything?q=";

function getApiKey() {
    return API_KEYS[currentApiKeyIndex];
}

function switchToNextApiKey() {
    currentApiKeyIndex = (currentApiKeyIndex + 1) % API_KEYS.length;
}

async function fetchWithRetry(endpoint) {
    let retries = API_KEYS.length;
    while (retries > 0) {
        try {
            const apiKey = getApiKey();
            const updatedEndpoint = endpoint.replace(/apiKey=[^&]+/, `apiKey=${apiKey}`);

            const res = await fetch(updatedEndpoint);
            const data = await res.json();

            if (data.status === "error" && data.code === "rateLimited") {
                switchToNextApiKey();
                retries--;
                if (retries > 0) {
                    continue;
                } else {
                    throw new Error("API limit reached for all keys");
                }
            }
            return data;
        } catch (error) {
            console.error("Error fetching data:", error.message);
            retries--;
            if (retries <= 0) {
                showNotification("Failed to fetch news after using all API keys. Please try again later.");
            }
        }
    }
}

async function fetchNews() {
    try {
        const articles = [];
        const currentDate = new Date();

        for (let i = 0; i < 3; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - i);
            const formattedDate = date.toISOString().split('T')[0];
            const dateQuery = `&from=${formattedDate}T00:00:00Z&to=${formattedDate}T23:59:59Z`;
            const endpoint = `${url}top-headlines${dateQuery}&apiKey=${getApiKey()}`;

            const data = await fetchWithRetry(endpoint);

            if (data.articles && data.articles.length > 0) {
                const sortedArticles = data.articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
                articles.push(...sortedArticles.slice(0, Math.max(sortedArticles.length, 10)));
            }
        }
            bindData(articles);
            storeInLocalStorage(articles[0]);
    } catch (error) {
        console.error("Error fetching news:", error);
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;

        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
        const mode = localStorage.getItem("Mode");
        if (mode === "true") {
            change(true);
        } else {
            change(false);
        }
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");
    const copyIcon = cardClone.querySelector(".fa-copy");

    newsTitle.setAttribute("data-url", article.url);
    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title || "No title available";
    newsDesc.innerHTML = article.description || "No description available";

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
    });
    newsSource.innerHTML = `${article.source.name || "Unknown source"}. ${date}`;

    const email = localStorage.getItem("email");
    [newsImg, newsTitle, newsSource, newsDesc].forEach(element => {
        element.addEventListener("click", () => {
            window.open(article.url, "_blank");
            history(email, article.title, article.url, article.urlToImage, newsSource.innerHTML, article.description);
        });
    });

    copyIcon.addEventListener("click", () => {
        navigator.clipboard.writeText(article.url).then(() => {
            showNotification('Article URL copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
}

function storeInLocalStorage(article) {
    const articleData = {
        title: article.title || "No title available",
        url: article.url || "No URL available",
        imageUrl: article.urlToImage || "No image available",
        description: article.description || "No description available",
        source: article.source.name || "Unknown source",
        publishedAt: article.publishedAt || "Unknown date"
    };
    localStorage.setItem("recentNews", JSON.stringify(articleData));
}

window.addEventListener("load", () => {
    fetchNews();
});

function saved() {
    const card = event.target.closest(".card");

    if (card) {
        const email = localStorage.getItem("email");
        const newsUrl = card.querySelector("#news-title").getAttribute("data-url").trim();

        fetch(`http://localhost:8080/The_Noble_News/NewsServlet?email=${email}`)
                .then(response => response.json())
                .then(savedNewsList => {
                    const isNewsSaved = savedNewsList.some(news => news.url.trim() === newsUrl);

                    if (isNewsSaved) {
                        showNotification("This news is already saved!");
                    } else {
                        const newsImg = card.querySelector("#news-img").src;
                        const newsTitle = card.querySelector("#news-title").innerText.trim();
                        const newsSource = card.querySelector("#news-source").innerText.trim();
                        const newsDesc = card.querySelector("#news-desc").innerText.trim();

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
                                    showNotification("An error occurred while saving the news.");
                                });
                    }
                })
                .catch(error => {
                    console.error("Error checking saved news:", error);
                });
    }
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
    if (element === true) {
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