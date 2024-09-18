/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/JavaScript.js to edit this template
 */

const LoginForm = document.getElementById("login-form");
const RegisterForm = document.getElementById("register-form");
const ChangeRegister = document.getElementById("change-to-register");
const ChangeLogin = document.getElementById("change-to-login");
const HideRegister = document.getElementById("hide-register");
const HideLogin = document.getElementById("hide-login");
const Register = document.getElementById("register");
const Login = document.getElementById("login");
const ToggleLoginPage = document.getElementById("toggle-login");
const LoginPage = document.getElementById("login-page");
const Profile = document.getElementById("profile");
const features = document.getElementById("features");
const Logout = document.getElementById("logout");

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#Home").classList.add("active");
    const email = localStorage.getItem("email");
    if (email) {
        document.getElementById("display-login").style.display = "none";
        document.getElementById("display-profile").style.display = "block";
    } else {
        document.getElementById("display-login").style.display = "block";
        document.getElementById("display-profile").style.display = "none";
    }
});

document.addEventListener("click", function (event) {
    if (!LoginPage.contains(event.target) && event.target !== ToggleLoginPage) {
        LoginPage.style.display = "none";
        document.querySelector(".header").style.opacity = "1";
        document.getElementById("cards-main").style.opacity = "1";
    }
    if (!features.contains(event.target) && event.target !== Profile) {
        features.style.display = "none";
    }
});

ToggleLoginPage.addEventListener("click", function () {
    if (LoginPage.style.display === "flex") {
        LoginPage.style.display = "none";
        document.querySelector(".header").style.opacity = "1";
        document.getElementById("cards-main").style.opacity = "1";
    } else {
        LoginPage.style.display = "flex";
        document.querySelector(".header").style.opacity = "0.5";
        document.getElementById("cards-main").style.opacity = "0.5";
    }
});

ChangeRegister.addEventListener("click", function () {
    if (RegisterForm.style.display === "flex") {
        RegisterForm.style.display = "none";
    } else {
        RegisterForm.style.display = "flex";
        LoginForm.style.display = "none";
        ToggleLogin(HideRegister, Register, Login, HideLogin);
    }
});

ChangeLogin.addEventListener("click", function () {
    if (LoginForm.style.display === "flex") {
        LoginForm.style.display = "none";
    } else {
        LoginForm.style.display = "flex";
        RegisterForm.style.display = "none";
        ToggleLogin(HideLogin, Login, Register, HideRegister);
    }
});

function ToggleLogin(Element1, Element2, Element3, Element4) {
    Element1.style.display = "none";
    Element2.style.backgroundColor = "white";
    Element3.style.backgroundColor = "blueViolet";
    Element4.style.display = "block";
}

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const requestBody = `login-email=${encodeURIComponent(email)}&login-password=${encodeURIComponent(password)}`;

    fetch('/The_Noble_News/UserServlet?action=login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
    })
            .then(response => response.text())
            .then(data => {
                try {
                    const parsedData = JSON.parse(data);

                    if (parsedData.status === 'success') {
                        localStorage.setItem("email", parsedData.email);
                        alert('Login successful!');
                        LoginPage.style.display = "none";
                        document.getElementById("display-login").style.display = "none";
                        document.getElementById("display-profile").style.display = "block";
                        document.querySelector(".header").style.opacity = "1";
                        document.getElementById("cards-main").style.opacity = "1";
                        document.getElementById("login-form").reset();
                        const socialSharing = document.querySelectorAll(".social-sharing");
                        socialSharing.forEach(icon => {
                            icon.style.display = "flex";
                        });
                        const savedNewsIcons = document.querySelectorAll(".saved-news");
                        savedNewsIcons.forEach(icon => {
                            icon.style.display = "block";
                        });
                    } else {
                        alert(parsedData.message);
                        document.getElementById("display-login").style.display = "block";
                        document.getElementById("display-profile").style.display = "none";
                        document.getElementById("login-form").reset();
                        const socialSharing = document.querySelectorAll(".social-sharing");
                        socialSharing.forEach(icon => {
                            icon.style.display = "none";
                        });
                        const savedNewsIcons = document.querySelectorAll(".saved-news");
                        savedNewsIcons.forEach(icon => {
                            icon.style.display = "none";
                        });
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
});

document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const requestBody = `register-username=${encodeURIComponent(username)}&register-email=${encodeURIComponent(email)}&register-password=${encodeURIComponent(password)}`;

    fetch('/The_Noble_News/UserServlet?action=register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
    })
            .then(response => response.text())
            .then(data => {
                try {
                    const parsedData = JSON.parse(data);

                    if (parsedData.status === 'success') {
                        alert('Registration successful! Please login.');
                        document.getElementById("register-form").reset();
                    } else {
                        alert(parsedData.message);
                        document.getElementById("register-form").reset();
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
});

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
                alert("Failed to fetch news after using all API keys. Please try again later.");
            }
        }
    }
}

async function fetchNews(query = "", selectedLanguage = "en") {
    try {
        const countryElement = document.getElementById("country");
        const dateElement = document.getElementById("date");

        const country = countryElement ? countryElement.value || "in" : "in";
        const date = dateElement ? dateElement.value : "";

        query = query || country;
        const currentDate = new Date();
        let dateQuery = "";
        if (date) {
            const selectedDate = new Date(date);
            if (selectedDate > currentDate) {
                alert("Selected date is in the future. Please select a valid date.");
                dateElement.value = "";
                return;
            } else {
                const oneDayBefore = new Date(selectedDate);
                oneDayBefore.setDate(selectedDate.getDate() - 1);
                const formattedDate = oneDayBefore.toISOString().split('T')[0];
                dateQuery = `&from=${formattedDate}T00:00:00Z&to=${formattedDate}T23:59:59Z`;
            }
        }

        const endpoint = `${url}${query}${dateQuery}&apiKey=${getApiKey()}&language=${selectedLanguage}`;
        const data = await fetchWithRetry(endpoint);

        if (!data.articles || data.articles.length === 0) {
            alert("No news found");
            onNavItemClick('Home');
        } else {
            const sortedArticles = data.articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
            const allNews = sortedArticles.slice(0);
            bindData(allNews);
            const email = localStorage.getItem('email');
            const savedNewsIcons = document.querySelectorAll(".saved-news");
            const socialSharing = document.querySelectorAll(".social-sharing");
            if (email) {
                socialSharing.forEach(icon => {
                    icon.style.display = "flex";
                });
                savedNewsIcons.forEach(icon => {
                    icon.style.display = "block";
                });
                const mode = localStorage.getItem("Mode");
                if (mode === "true") {
                    changes(true);
                } else {
                    changes(false);
                }
            } else {
                socialSharing.forEach(icon => {
                    icon.style.display = "none";
                });
                savedNewsIcons.forEach(icon => {
                    icon.style.display = "none";
                });
            }
        }
    } catch (error) {
        console.error("Error fetching news:", error);
}
}

let lastBreakingNewsId = localStorage.getItem("lastBreakingNewsId") || "";
const breakingNewsFetchInterval = 15 * 60 * 1000; // 15 minutes

async function fetchBreakingNews() {
    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        const startDateString = startDate.toISOString().split('T')[0];
        const endDateString = today.toISOString().split('T')[0];

        const endpoint = `${url}breaking-news&from=${startDateString}&to=${endDateString}&apiKey=${getApiKey()}&language=en`;
        const data = await fetchWithRetry(endpoint);

        if (data.articles && data.articles.length > 0) {
            let latestBreakingNews = null;
            let oldBreakingNews = [];

            for (let article of data.articles) {
                const newsDate = new Date(article.publishedAt).toISOString().split('T')[0];
                const todayString = today.toISOString().split('T')[0];

                if (newsDate === todayString && article.title !== lastBreakingNewsId) {
                    latestBreakingNews = article;
                } else {
                    oldBreakingNews.push(article);
                }
            }

            if (latestBreakingNews && latestBreakingNews.title !== lastBreakingNewsId) {
                lastBreakingNewsId = latestBreakingNews.title;
                localStorage.setItem("lastBreakingNewsId", lastBreakingNewsId);

                const userResponse = confirm("Breaking News found! Do you want to see it?");
                if (userResponse) {
                    localStorage.setItem("breakingNews", JSON.stringify({latest: latestBreakingNews, old: oldBreakingNews}));
                    window.open("BreakingNews.html", "_blank");
                }
            } else {
                localStorage.setItem("breakingNews", JSON.stringify({latest: null, old: oldBreakingNews}));
            }
        }
    } catch (error) {
        console.error("Error fetching breaking news:", error);
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article, index) => {
        if (!article.urlToImage)
            return;

        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);

        cardsContainer.appendChild(cardClone);
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
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
    });
    newsSource.innerHTML = `${article.source.name}. ${date}`;

    const email = localStorage.getItem("email");
    newsImg.addEventListener("click", () => {
        window.open(article.url, "_blank");
        history(email, article.title, article.url, article.urlToImage, newsSource.innerHTML, article.description);
    });
    newsTitle.addEventListener("click", () => {
        window.open(article.url, "_blank");
        history(email, article.title, article.url, article.urlToImage, newsSource.innerHTML, article.description);
    });
    newsSource.addEventListener("click", () => {
        window.open(article.url, "_blank");
        history(email, article.title, article.url, article.urlToImage, newsSource.innerHTML, article.description);
    });
    newsDesc.addEventListener("click", () => {
        window.open(article.url, "_blank");
        history(email, article.title, article.url, article.urlToImage, newsSource.innerHTML, article.description);
    });
    copyIcon.addEventListener("click", () => {
        navigator.clipboard.writeText(article.url).then(() => {
            showNotification('Article URL copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });
}

function handleLanguageChange() {
    const selectedLanguage = document.getElementById("language").value;
    updateNavbarLanguage();
    fetchNewsBasedOnCountry(selectedLanguage);
}

function syncLanguageWithCountry() {
    const countrySelect = document.getElementById('country');
    const languageSelect = document.getElementById('language');

    const selectedCountry = countrySelect.value;
    if (selectedCountry !== 'in') {
        languageSelect.value = 'en';
        document.getElementById("hindi").style.display = "none";
        document.getElementById("marathi").style.display = "none";
    } else {
        document.getElementById("hindi").style.display = "block";
        document.getElementById("marathi").style.display = "block";
    }
    updateNavbarLanguage();
    fetchNewsBasedOnCountry(languageSelect.value);
}

function fetchNewsBasedOnCountry(selectedLanguage) {
    const countrySelect = document.getElementById('country');
    const selectedCountry = countrySelect.value || "in";
    fetchNews(selectedCountry, selectedLanguage);
}

function fetchNewsBasedOnDate() {
    const dateElement = document.getElementById("date");
    const selectedDate = dateElement ? dateElement.value : "";
    const languageElement = document.getElementById("language");
    const selectedLanguage = languageElement ? languageElement.value : "en";
    fetchNews("", selectedLanguage);
}

function updateNavbarLanguage() {
    const languageElement = document.getElementById("language");
    const selectedLanguage = languageElement ? languageElement.value : "en";
    document.querySelectorAll('[data-translate]').forEach(el => {
        const translationKey = el.getAttribute('data-translate');
        el.textContent = translations[selectedLanguage][translationKey] || translationKey;
    });
}

let curSelectedNav = null;
function onNavItemClick(id) {
    if (id === 'Home') {
        window.location.reload();
        return;
    }

    const languageElement = document.getElementById("language");
    const selectedLanguage = languageElement ? languageElement.value : "en";

    const query = id === "Home" ? "" : id;

    fetchNews(query, selectedLanguage);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
    document.getElementById("Home").classList.remove("active");
}

const searchText = document.getElementById("search-bar");

searchText.addEventListener("keyup", (event) => {
    if (event.key === 'Enter') {
        const query = searchText.value;
        const languageElement = document.getElementById("language");
        const selectedLanguage = languageElement ? languageElement.value : "en";
        if (!query)
            return;
        fetchNews(query, selectedLanguage);
        curSelectedNav?.classList.remove("active");
        curSelectedNav = null;
    }
});


function startBreakingNewsFetch() {
    fetchBreakingNews();
    setInterval(fetchBreakingNews, breakingNewsFetchInterval);
}

window.addEventListener("load", () => {
    syncLanguageWithCountry();
    fetchNews();
    startBreakingNewsFetch();
});

document.getElementById('country').addEventListener('change', syncLanguageWithCountry);
document.getElementById('language').addEventListener('change', handleLanguageChange);
document.getElementById('date').addEventListener('change', fetchNewsBasedOnDate);
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => onNavItemClick(item.id));
});

const translations = {
    en: {
        home: "Home",
        'Breaking News': 'Breaking News',
        politics: "Politics",
        business: "Business",
        world: "World",
        education: "Education",
        technology: "Technology",
        science: "Science",
        health: "Health",
        sports: "Sports",
        entertainment: "Entertainment",
        lifestyle: "Lifestyle",
        environment: "Environment",
        crime: "Crime"
    },
    hi: {
        home: "मुख्य पृष्ठ",
        'Breaking News': 'ब्रेकिंग न्यूज़',
        politics: "राजनीति",
        business: "व्यापार",
        world: "दुनिया",
        education: "शिक्षा",
        technology: "प्रौद्योगिकी",
        science: "विज्ञान",
        health: "स्वास्थ्य",
        sports: "खेल",
        entertainment: "मनोरंजन",
        lifestyle: "लाइफस्टाइल",
        environment: "पर्यावरण",
        crime: "अपराध"
    },
    mr: {
        home: "मुख्य पृष्ठ",
        'Breaking News': 'ब्रेकिंग न्यूज',
        politics: "राजकारण",
        business: "व्यवसाय",
        world: "जग",
        education: "शिक्षा",
        technology: "तंत्रज्ञान",
        science: "विज्ञान",
        health: "आरोग्य",
        sports: "खेल",
        entertainment: "मनोरंजन",
        lifestyle: "लाइफस्टाइल",
        environment: "पर्यावरण",
        crime: "अपराध"
    }
};

Profile.addEventListener("click", function () {
    if (features.style.display === "flex") {
        features.style.display = "none";
    } else {
        features.style.display = "flex";
    }
});

Logout.addEventListener("click", function () {
    features.style.display = "none";
    document.getElementById("display-profile").style.display = "none";
    document.getElementById("display-login").style.display = "block";
    localStorage.removeItem("email");
    const savedNewsIcons = document.querySelectorAll(".saved-news");
    savedNewsIcons.forEach(icon => {
        icon.style.display = "none";
    });
    localStorage.setItem("Mode", false);
    location.reload();
});

const ToggleMode = document.getElementById("mode-div");
ToggleMode.addEventListener("click", function () {
    let mode = document.querySelector("#mode");
    if (mode.classList.contains("fa-toggle-off")) {
        localStorage.setItem("Mode", true);
        changes(true);
    } else {
        localStorage.setItem("Mode", false);
        changes(false);
    }
});

function changes(element) {
    let mode = document.querySelector("#mode");
    if (element === true) {
        mode.classList.remove("fa-toggle-off");
        mode.classList.add("fa-toggle-on");
        document.getElementById("cards-main").style.backgroundColor = "#454545";
        let cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.backgroundColor = '#454545';
        });
        document.getElementById("features").style.backgroundColor = "#454545";
        let titles = document.querySelectorAll("#news-title");
        let descs = document.querySelectorAll(".news-desc");
        let option = document.querySelectorAll(".options");
        changeColor([...titles, ...descs, ...option], 'white');
    } else {
        mode.classList.remove("fa-toggle-on");
        mode.classList.add("fa-toggle-off");
        document.getElementById("cards-main").style.backgroundColor = "#f0f0f0";
        let cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.backgroundColor = '#fff';
        });
        document.getElementById("features").style.backgroundColor = "#f0f0f0";
        let titles = document.querySelectorAll("#news-title");
        let descs = document.querySelectorAll(".news-desc");
        let option = document.querySelectorAll(".options");
        changeColor([...titles, ...descs, ...option], 'black');
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

document.getElementById("saved-div").addEventListener("click", () => {
    window.location.href = "savedNews.html";
});

document.getElementById("history-div").addEventListener("click", () => {
    window.location.href = "History.html";
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

function Comments(commentIcon) {
    const card = commentIcon.closest('.card');
    const imgSrc = card.querySelector('#news-img').src;
    const title = card.querySelector('#news-title').textContent;
    const source = card.querySelector('#news-source').textContent;
    const description = card.querySelector('#news-desc').textContent;
    const url = card.querySelector('#news-title').getAttribute('data-url');
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
