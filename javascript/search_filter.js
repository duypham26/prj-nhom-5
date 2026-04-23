function normalize(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")   // xoa dau
        .replace(/đ/gi, "d")               // đ → d
        .toLowerCase();
}

document.querySelector(".ntbutton").addEventListener("click", runSearch);

document.querySelector(".search-box input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") runSearch();
});

function runSearch() {
    var raw     = document.querySelector(".search-box input").value.trim();
    var keyword = normalize(raw);  // normalize keyword nguoi dung nhap

    var hero        = document.querySelector(".hero");
    var mediumCards = document.querySelectorAll(".news-card-medium");
    var smallCards  = document.querySelectorAll(".news-card-small");
    var grid2col    = document.querySelector(".news-grid-2col");
    var grid4col    = document.querySelector(".news-grid-4col");

    var oldMsg = document.getElementById("search-no-result");
    if (oldMsg) oldMsg.remove();

    var found = 0;

    // --- Hero ---
    if (hero) {
        var heroTitle = hero.querySelector("h3");
        if (heroTitle && (keyword === "" || normalize(heroTitle.textContent).includes(keyword))) {
            hero.style.display = "";
            found++;
        } else {
            hero.style.display = "none";
        }
    }

    // --- Grid 2 col ---
    var visible2col = 0;
    mediumCards.forEach(function (card) {
        var titleEl = card.querySelector("h3");
        if (!titleEl) return;
        if (keyword === "" || normalize(titleEl.textContent).includes(keyword)) {
            card.style.display = "";
            visible2col++;
            found++;
        } else {
            card.style.display = "none";
        }
    });
    if (grid2col) grid2col.style.display = visible2col === 0 ? "none" : "";

    // --- Grid 4 col ---
    var visible4col = 0;
    smallCards.forEach(function (card) {
        var titleEl = card.querySelector("h4");
        if (!titleEl) return;
        if (keyword === "" || normalize(titleEl.textContent).includes(keyword)) {
            card.style.display = "";
            visible4col++;
            found++;
        } else {
            card.style.display = "none";
        }
    });
    if (grid4col) grid4col.style.display = visible4col === 0 ? "none" : "";

    // --- Thong bao khong co ket qua ---
    if (found === 0 && keyword !== "") {
        var msg = document.createElement("p");
        msg.id = "search-no-result";
        msg.textContent = 'Không tìm thấy bài viết nào cho từ khóa "' + raw + '".';
        msg.style.cssText = "text-align:center;padding:40px 0;color:#888;font-size:1rem;";
        document.querySelector("main").appendChild(msg);
    }
}