// =========================
// Inisialisasi Peta
// =========================

const map = L.map('map').setView([-2.5, 118], 5);

const resetViewControl = L.control({
    position: "topleft"
});

resetViewControl.onAdd = function(){

    const div = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control"
    );

    div.innerHTML = `
        <a href="#" title="Reset View">
            <i class="fa-solid fa-globe"></i>
        </a>
    `;

    div.style.backgroundColor = "white";
    div.style.width = "34px";
    div.style.height = "34px";
    div.style.lineHeight = "34px";
    div.style.textAlign = "center";
    div.style.fontSize = "16px";

    div.onclick = function(e){

        e.preventDefault();

        map.flyTo(
            [-2.5,118],
            5,
            {
                duration:1.5
            }
        );

        document.getElementById("wppFilter").value = "all";
        document.getElementById("apiFilter").value = "all";

        document
            .getElementById("wppFilter")
            .dispatchEvent(new Event("change"));

        document
            .getElementById("apiFilter")
            .dispatchEvent(new Event("change"));

    };

    return div;
};

resetViewControl.addTo(map);

// =========================
// Basemap Esri Imagery
// =========================

const imagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Esri'
    }
);

// =========================
// Label Esri
// =========================

const labels = L.tileLayer(
    'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Esri'
    }
);

imagery.addTo(map);
labels.addTo(map);

// =========================
// Daftar WPP
// =========================

const daftarWPP = [
    "571",
    "572",
    "573",
    "711",
    "712",
    "713",
    "714",
    "715",
    "716",
    "717",
    "718"
];

// =========================
// Warna WPP
// =========================

const warnaWPP = {
    "571":"rgb(235,100,22)",
    "572":"rgb(55,126,184)",
    "573":"rgb(77,190,77)",
    "711":"rgb(152,78,163)",
    "712":"rgb(255,127,0)",
    "713":"rgb(255,255,51)",
    "714":"rgb(166,86,40)",
    "715":"rgb(247,129,191)",
    "716":"rgb(153,153,153)",
    "717":"rgb(102,194,165)",
    "718":"rgb(252,141,98)"
};

const infoWPP = {

    "571":{
        nama:"Selat Malaka"
    },

    "572":{
        nama:"Samudera Hindia Barat Sumatera"
    },

    "573":{
        nama:"Samudera Hindia Selatan Jawa"
    },

    "711":{
        nama:"Selat Karimata - Laut Natuna"
    },

    "712":{
        nama:"Laut Jawa"
    },

    "713":{
        nama:"Selat Makassar"
    },

    "714":{
        nama:"Laut Banda"
    },

    "715":{
        nama:"Teluk Tomini - Maluku"
    },

    "716":{
        nama:"Laut Sulawesi"
    },

    "717":{
        nama:"Teluk Cenderawasih - Pasifik"
    },

    "718":{
        nama:"Laut Arafura"
    }

};
// =========================
// Posisi Label Manual
// =========================

const posisiKhusus = {

    // Selat Malaka
    "571":[5.04717073691972,98.62113378666317],

    // Selatan Jawa
    "573":[-9.96885060854611,114.51686928766289],

    // Selatan NTT
    "717":[1.098565496040652,135.111068044483],

    // Laut Arafura
    "718":[-7.710991655433217,134.45240497123714]

};

// =========================
// Menyimpan Layer
// =========================

const wppLayers = {};
const wppLabels = {};

// =========================
// Load Semua WPP
// =========================

daftarWPP.forEach(wpp => {

    fetch(`data/${wpp}.geojson`)

    .then(response => response.json())

    .then(data => {

        const layer = L.geoJSON(data, {

            style: {

                color: warnaWPP[wpp],
                weight: 4,
                opacity: 1,

                fillColor: warnaWPP[wpp],
                fillOpacity: 0.35

            },

            onEachFeature: function(feature, layerFeature) {

    // Hover masuk
    layerFeature.on("mouseover", function() {

        this.setStyle({
            weight: 6,
            fillOpacity: 0.6
        });

    });

    // Hover keluar
    layerFeature.on("mouseout", function() {

        this.setStyle({
            weight: 4,
            fillOpacity: 0.35
        });

    });

    // Klik polygon
    layerFeature.on("click", function() {

        map.fitBounds(
            layer.getBounds()
        );

        const kodeWPP = String(wpp);

        if(
            kodeWPP === "711" ||
            kodeWPP === "712"
        ){

            // ubah nilai dropdown
            document
                .getElementById("wppFilter")
                .value = kodeWPP;

            document
                .getElementById("apiFilter")
                .value = kodeWPP;

            // trigger event change seperti klik manual
            document
                .getElementById("wppFilter")
                .dispatchEvent(
                    new Event("change")
                );

            document
                .getElementById("apiFilter")
                .dispatchEvent(
                    new Event("change")
                );

        }

        layerFeature.bindPopup(`
            <h3>WPPNRI ${kodeWPP}</h3>
            <hr>
            <p><b>Nama:</b> ${infoWPP[kodeWPP].nama}</p>
            <p><b>Kode:</b> ${kodeWPP}</p>
        `);

        layerFeature.openPopup();

    });

}

        }).addTo(map);

        // Simpan polygon
        wppLayers[wpp] = layer;

        // =========================
        // Label WPP
        // =========================

        if (posisiKhusus[wpp]) {

            const label = L.marker(
                posisiKhusus[wpp],
                {
                    interactive:false,

                    icon:L.divIcon({
                        className:"wpp-tooltip",
                        html:`WPP ${wpp}`,
                        iconSize:[100,25]
                    })
                }
            ).addTo(map);

            wppLabels[wpp] = label;

        }

        else {

            layer.bindTooltip(
                `WPP ${wpp}`,
                {
                    permanent:true,
                    direction:'center',
                    className:'wpp-tooltip'
                }
            );

            wppLabels[wpp] = layer;

        }

    })

    .catch(error => {

        console.error(
            `Gagal memuat WPP ${wpp}`,
            error
        );

    });

});
// =========================
// Sidebar Toggle
// =========================

const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");

if (sidebar && toggleBtn) {

    toggleBtn.addEventListener("click", () => {

        sidebar.classList.toggle("collapsed");

        setTimeout(() => {

            map.invalidateSize();

        }, 300);

    });

} else {

    console.error(
        "sidebar atau toggleBtn tidak ditemukan"
    );

}


// =========================
// KONTROL CHECKBOX WPP
// =========================

document.querySelectorAll(".wpp-check").forEach(check => {

    check.addEventListener("change", function(){

        const wpp = this.value;

        // Layer belum selesai dimuat
        if(!wppLayers[wpp]) return;

        if(this.checked){

            map.addLayer(wppLayers[wpp]);

            if(
                wppLabels[wpp] &&
                !map.hasLayer(wppLabels[wpp])
            ){
                map.addLayer(wppLabels[wpp]);
            }

        }else{

            if(map.hasLayer(wppLayers[wpp])){
                map.removeLayer(wppLayers[wpp]);
            }

            if(
                wppLabels[wpp] &&
                map.hasLayer(wppLabels[wpp])
            ){
                map.removeLayer(wppLabels[wpp]);
            }

        }

    });

});

let nonPipp711;
let nonPipp712;

let data711 = [];
let data712 = [];

let daftarLokasi = [];

function resetAllPoints(){

    if(nonPipp711){

        nonPipp711.eachLayer(function(l){

            l.setStyle({
                radius: 7,
                fillColor: "#ff0000",
                color: "#ffffff",
                weight: 1,
                fillOpacity: 0.25,
                opacity: 0.25
            });

        });

    }

    if(nonPipp712){

        nonPipp712.eachLayer(function(l){

            l.setStyle({
                radius: 7,
                fillColor: "#ff0000",
                color: "#ffffff",
                weight: 1,
                fillOpacity: 0.25,
                opacity: 0.25
            });

        });

    }

}

// -------------------------
// Load Non PIPP 711
// -------------------------
fetch("data/Non_PIPP_711.geojson")
.then(res => {

    console.log("Status 711 :", res.status);

    if(!res.ok){
        throw new Error("Non_PIPP_711.geojson tidak ditemukan");
    }

    return res.json();

})
.then(data => {

    data711 = data.features;
    updateApiChart("all");

updateChart(
    document.getElementById('wppFilter').value
);

    console.log(
        "Feature 711 :",
        data.features.length
    );

    data.features.forEach(feature => {

    daftarLokasi.push({
        nama: feature.properties.desa_kelurahan,
        feature: feature
    });

});

    nonPipp711 = L.geoJSON(data, {

    pointToLayer: function(feature, latlng){

        return L.circleMarker(latlng,{
            radius:7,
            fillColor:"#ff0000",
            color:"#ffffff",
            weight:1,
            fillOpacity:0.9
        });

    },

    onEachFeature: function(feature, layer){

        layer.on("click", function(){

            resetAllPoints();
map.flyTo(
        layer.getLatLng(),
        9,
        {
            duration: 1
        }
    );
            this.setStyle({

                radius:14,
                fillColor:"#ffff00",
                color:"#ffffff",
                weight:3,
                fillOpacity:1,
                opacity:1

            });

            layer.bindPopup(`

    <h3>${feature.properties.desa_kelurahan}</h3>

    <hr>

    <p>
        <b>Kelompok Potensi:</b><br>
        ${feature.properties["Kelompok potensi"] ?? "-"}
    </p>

    <p>
        <b>Produksi:</b>
        ${feature.properties.produksi ?? "-"}
    </p>

    <p>
        <b>Jenis API:</b><br>
        ${feature.properties.Jenis_API ?? "-"}
    </p>

    <p>
        <b>Jenis Kapal:</b><br>
        ${feature.properties.Jenis_Kapal ?? "-"}
    </p>

`);

layer.openPopup();

        });

    }

});

    console.log(
        "Layer 711 berhasil dibuat"
    );

})
.catch(err => {

    console.error(
        "ERROR NON PIPP 711 :",
        err
    );

});


// -------------------------
// Load Non PIPP 712
// -------------------------
fetch("data/Non_PIPP_712.geojson")
.then(res => {

    console.log("Status 712 :", res.status);

    if(!res.ok){
        throw new Error("Non_PIPP_712.geojson tidak ditemukan");
    }

    return res.json();

})

.then(data => {

    data712 = data.features;
    updateApiChart("all");

    console.log(
        "Feature 712 :",
        data.features.length
    );

    updateChart(
        document.getElementById('wppFilter').value
    );
    
    data.features.forEach(feature => {

    daftarLokasi.push({
        nama: feature.properties.desa_kelurahan,
        feature: feature
    });

});
    nonPipp712 = L.geoJSON(data, {

        pointToLayer: function(feature, latlng){

            return L.circleMarker(latlng,{
                radius: 7,
                fillColor: "#ff0000",
                color: "#ffffff",
                weight: 1,
                fillOpacity: 0.9
            });

        },

        onEachFeature: function(feature, layer){

            layer.on("click", function(){

                resetAllPoints();
map.flyTo(
        layer.getLatLng(),
        9,
        {
            duration: 1
        }
    );
                this.setStyle({

                    radius: 14,
                    fillColor: "#ffff00",
                    color: "#ffffff",
                    weight: 3,
                    fillOpacity: 1,
                    opacity: 1

                });

                layer.bindPopup(`

    <h3>${feature.properties.desa_kelurahan}</h3>

    <hr>

    <p>
        <b>Kelompok Potensi:</b><br>
        ${feature.properties["Kelompok potensi"] ?? "-"}
    </p>

    <p>
        <b>Produksi:</b>
        ${feature.properties.produksi ?? "-"}
    </p>

    <p>
        <b>Jenis API:</b><br>
        ${feature.properties.Jenis_API ?? "-"}
    </p>

    <p>
        <b>Jenis Kapal:</b><br>
        ${feature.properties.Jenis_Kapal ?? "-"}
    </p>

`);

layer.openPopup();

            });

        }

    });

    console.log(
        "Layer 712 berhasil dibuat"
    );

    console.log(
        "Jumlah Layer 712 :",
        nonPipp712.getLayers().length
    );
})

.catch(err => {

    console.error(
        "ERROR NON PIPP 712 :",
        err
    );

})

// =========================
// RESET HIGHLIGHT SAAT KLIK PETA
// =========================

map.on("click", function(e){

    if(e.originalEvent.target.closest(".leaflet-interactive")){
        return;
    }

    if(nonPipp711){

        nonPipp711.eachLayer(function(l){

            l.setStyle({
                radius: 7,
                fillColor: "#ff0000",
                color: "#ffffff",
                weight: 1,
                fillOpacity: 0.9,
                opacity: 1
            });

        });

    }

    if(nonPipp712){

        nonPipp712.eachLayer(function(l){

            l.setStyle({
                radius: 7,
                fillColor: "#ff0000",
                color: "#ffffff",
                weight: 1,
                fillOpacity: 0.9,
                opacity: 1
            });

        });

    }

});

// =========================
// TOGGLE NON PIPP 711
// =========================

document
.getElementById("non711")
.addEventListener("change", function(){

    if(!nonPipp711){
        return;
    }

    if(this.checked){

        map.addLayer(nonPipp711);

    }else{

        map.removeLayer(nonPipp711);

    }

});


// =========================
// TOGGLE NON PIPP 712
// =========================

document
.getElementById("non712")
.addEventListener("change", function(){

    if(!nonPipp712){
        return;
    }

    if(this.checked){

        map.addLayer(nonPipp712);

    }else{

        map.removeLayer(nonPipp712);

    }

});

document
.getElementById("searchBtn")
.addEventListener("click", function(){

    const keyword =
        document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    if(!keyword) return;

    let found = false;

    // Cari di Non PIPP 711
    if(nonPipp711){

        nonPipp711.eachLayer(function(layer){

            const nama =
                layer.feature.properties
                .desa_kelurahan
                ?.toLowerCase();

            if(nama && nama.includes(keyword)){

                found = true;

                map.flyTo(
                    layer.getLatLng(),
                    9,
                    {
                        duration:1.5
                    }
                );

                layer.fire("click");

            }

        });

    }

    // Cari di Non PIPP 712
    if(nonPipp712){

        nonPipp712.eachLayer(function(layer){

            const nama =
                layer.feature.properties
                .desa_kelurahan
                ?.toLowerCase();

            if(nama && nama.includes(keyword)){

                found = true;

                map.flyTo(
                    layer.getLatLng(),
                    9,
                    {
                        duration:1.5
                    }
                );

                layer.fire("click");

            }

        });

    }

    if(!found){

        alert(
            "Lokasi tidak ditemukan"
        );

    }

});

document
.getElementById("searchInput")
.addEventListener("keypress", function(e){

    if(e.key === "Enter"){

        document
        .getElementById("searchBtn")
        .click();

    }

});

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");

searchInput.addEventListener("input", function(){

    const keyword = this.value.toLowerCase();

    suggestions.innerHTML = "";

    if(keyword.length < 2){

        suggestions.style.display = "none";
        return;

    }

    const hasil = daftarLokasi.filter(item =>
        item.nama.toLowerCase().includes(keyword)
    );

    hasil.slice(0,10).forEach(item => {

        const div = document.createElement("div");

        div.className = "suggestion-item";

        div.textContent = item.nama;

        div.addEventListener("click", () => {

            searchInput.value = item.nama;

            suggestions.style.display = "none";

            const lat =
                item.feature.geometry.coordinates[1];

            const lon =
                item.feature.geometry.coordinates[0];

            map.setView([lat, lon], 12);

        });

        suggestions.appendChild(div);

    });

    suggestions.style.display =
        hasil.length ? "block" : "none";

});

const ctx = document
    .getElementById('landingChart')
    .getContext('2d');

const landingChart = new Chart(ctx, {

    type: 'bar',

    data: {

        labels: [],

        datasets: [{
            label: 'Produksi (Ton)',
            data: []
        }]

    },

    options: {

    indexAxis: 'y',

    responsive: true,

    plugins: {

        legend: {
            display: false
        },

        tooltip: {
            callbacks: {
                label: function(context){
                    return context.raw.toLocaleString('id-ID') + ' kg';
                }
            }
        }

    },

    scales: {

        x: {

            title: {
                display: true,
                text: 'Produksi (kg)'
            },

            ticks: {
                callback: function(value){
                    return value.toLocaleString('id-ID');
                }
            }

        },

        y: {
            title: {
                display: true,
                text: 'Titik Pendaratan'
            }
        }

    }

}

});

const pieCtx = document
    .getElementById("apiPieChart")
    .getContext("2d");

const apiPieChart = new Chart(pieCtx, {

    type: "pie",

    data: {

        labels: [],

        datasets: [{
            data: []
        }]
    },

    options: {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

        legend: {
            position: "right"
        },

        tooltip: {

            callbacks: {

                label: function(context){

                    const total =
                        context.dataset.data.reduce(
                            (a,b)=>a+b,
                            0
                        );

                    const persen =
                        (
                            context.raw /
                            total *
                            100
                        ).toFixed(1);

                    return `${context.label}: ${context.raw} (${persen}%)`;

                }

            }

        }

    },

    radius: "80%"

}

});

function updateChart(wpp){

    let features = [];

    if(wpp === "711"){

        features = data711;

    }
    else if(wpp === "712"){

        features = data712;

    }
    else{

        features = [
            ...data711,
            ...data712
        ];

    }

    
    const chartData = features

    .filter(f =>
        f.properties.produksi
    )

    .map(f => {

        const produksiRaw =
            String(f.properties.produksi);

        const produksi =
            parseFloat(
                produksiRaw
                    .replace(/kg/gi,'')
                    .replace(/\./g,'')
                    .replace(/,/g,'')
                    .trim()
            );

        return {
            nama: f.properties.desa_kelurahan,
            produksi: produksi
        };

    });

const chartDataClean =
    chartData.filter(
        d => !isNaN(d.produksi)
    );

const top10 = chartDataClean

    .sort(
        (a,b) => b.produksi - a.produksi
    )

    .slice(0,10);
    window.top10 = top10;
console.log("TOP10 LENGTH =", top10.length);
console.table(top10);

landingChart.data.labels =
    top10.map(d => d.nama);

landingChart.data.datasets[0].data =
    top10.map(d => d.produksi);

landingChart.update();
}

document
.getElementById('wppFilter')
.addEventListener('change', function(){

    updateChart(this.value);

});

function updateApiChart(wpp){

    let features = [];

    if(wpp === "711"){

        features = data711;

    }
    else if(wpp === "712"){

        features = data712;

    }
    else{

        features = [
            ...data711,
            ...data712
        ];

    }

    const kelompokAPI = {};

    features.forEach(f => {

        const apiRaw =
            f.properties.Jenis_API;

        if(!apiRaw) return;

        const alatTangkap = apiRaw

            .toLowerCase()

            .replace(/ dan /gi, ",")

            .split(",")

            .map(x => x.trim())

            .filter(x => x !== "");

        alatTangkap.forEach(alat => {

    let namaAlat = alat
    .toLowerCase()
    .trim()
    .replace(/\s+/g," ");

    if(

    namaAlat.includes("jaring insang") ||

    namaAlat.includes("jaring ingsang") ||

    namaAlat.includes("jaring ingsan lingkar") ||

    namaAlat.includes("gillnet") ||

    namaAlat.includes("gill net") ||

    namaAlat.includes("gilnett") ||

    namaAlat.includes("giilnet") ||

    namaAlat.includes("gilnet") ||
    
    namaAlat.includes("rampus")

){

    namaAlat = "Jaring Insang";

}

else if(
    namaAlat.includes("pancing")
){
    namaAlat = "Pancing";
}

    else if(

    namaAlat.includes("trammel") ||

    namaAlat.includes("tramel")

){

    namaAlat = "Trammel Net";

}

else if(
    namaAlat.includes("arad")
){

    namaAlat = "Arad";

}

else if(
    namaAlat.includes("jaring hela")
){

    namaAlat = "Jaring Hela";

}

else if(

    namaAlat.includes("barriers") ||
    namaAlat.includes("fences") ||
    namaAlat.includes("weirs")

){

    namaAlat = "Perangkap Tetap";

}
else if(
    namaAlat.includes("klitik")
){

    namaAlat = "Jaring Klitik";

}

else if(
    namaAlat.includes("liong")
){

    namaAlat = "Liong Bun";

}
    else if(namaAlat.includes("bubu")){

        namaAlat = "Bubu";

    }
    else if(namaAlat.includes("rawai")){

        namaAlat = "Rawai";

    }
    else if(namaAlat.includes("bagan")){

        namaAlat = "Bagan";

    }
   else if(

    namaAlat.includes("trammel") ||
    namaAlat.includes("tramel") ||
    namaAlat.includes("tramnel")

){

    namaAlat = "Trammel Net";

}
    else if(namaAlat.includes("lampara") ||
    namaAlat.includes("lampra dasar") 
    
    ){

        namaAlat = "Lampara";

    }
    else if(namaAlat.includes("togok") ||
    namaAlat.includes("togo")
    
    ){

        namaAlat = "Togok";

    }
    else if(namaAlat.includes("jala")){

        namaAlat = "Jala";

    }

    else if(namaAlat.includes("pukat") ||
    namaAlat.includes("ukat cincin")
    
    ){
    namaAlat = "Pukat Cincin";
}
else if(namaAlat.includes("pento")){
    namaAlat = "Pento";
}

else if(namaAlat.includes("penggaruk tanpa kapal")){
    namaAlat = "Penggaruk Tanpa Kapal";
}

else if(namaAlat.includes("penggaruk berkapal")){
    namaAlat = "Penggaruk Berkapal";
}

else if(namaAlat.includes("sondong")){
    namaAlat = "Sondong";
}

else if(namaAlat.includes("belat")){
    namaAlat = "Belat";
}
else if(namaAlat.includes("sero")){
    namaAlat = "Sero";
}
else if(namaAlat.includes("payang")){
    namaAlat = "Payang";
}
else if(namaAlat.includes("dogol")){
    namaAlat = "Dogol";
}
else if(namaAlat.includes("cantrang")){
    namaAlat = "Cantrang";
}

else if(namaAlat.includes("jaring angkat lainnya") ||
    namaAlat.includes("seser") || 
    namaAlat.includes("jaring angkat")

){
    namaAlat = "Jaring Angkat";
}

else if(namaAlat.includes("tidak tercatat")){
    namaAlat = "Tidak Tercatat";
}

else if(

    namaAlat.includes("purse seine") ||
    namaAlat.includes("purseine") ||
    namaAlat.includes("jaring lingkar")

){
    namaAlat = "Purse Seine";
}

else if(
    namaAlat.includes("rajungan")
){
    namaAlat = "Jaring Rajungan";
}

else if(
    namaAlat.includes("jaring tarik") ||
    namaAlat.includes("1. jtb") ||
    namaAlat.includes("jaring kantong bertarik") ||
    namaAlat.includes("jhd") ||
    namaAlat.includes("jtb") ||
    namaAlat.includes("perangkap")
){
    namaAlat = "Jaring Tarik Berkantong";
}

else if(
    namaAlat.includes("bouke ami") ||
    namaAlat.includes("baokemi") ||
    namaAlat.includes("bukaomi") ||
    namaAlat.includes("bukoami") 
){
    namaAlat = "Bouke Ami";
}

else if(
    namaAlat.includes("sodo")
){
    namaAlat = "Sodo";
}

else if(
    namaAlat.includes("rumpon")
){
    namaAlat = "Rumpon";
}

else if(
    namaAlat.includes("jaring cumi")
){
    namaAlat = "Jaring Cumi";
}

   else{

    console.log(
        "ALAT BELUM TERKLASIFIKASI:",
        alat
    );

    namaAlat = "Lainnya";

}

kelompokAPI[namaAlat] =
    (kelompokAPI[namaAlat] || 0) + 1;

});

    });

    

    const warna = [

        "#3366CC",
        "#DC3912",
        "#FF9900",
        "#109618",
        "#990099",
        "#0099C6",
        "#DD4477",
        "#66AA00",
        "#B82E2E",
        "#316395",
        "#994499",
        "#22AA99",
        "#AAAA11",
        "#6633CC",
        "#E67300",
        "#8B0707",
        "#329262",
        "#5574A6"

    ];

const sortedData =
    Object.entries(kelompokAPI)
    .sort((a,b) => b[1] - a[1]);

const top10 =
    sortedData.slice(0,10);

const lainnya =
    sortedData
        .slice(10)
        .reduce((sum,item) => sum + item[1], 0);

if(lainnya > 0){

    top10.push([
        "Lainnya",
        lainnya
    ]);

}

const labels =
    top10.map(d => d[0]);

const values =
    top10.map(d => d[1]);

apiPieChart.data.labels = labels;

apiPieChart.data.datasets[0].data = values;

    apiPieChart.data.datasets[0].backgroundColor =
        Object.keys(kelompokAPI)
            .map((_,i) =>
                warna[i % warna.length]
            );

    apiPieChart.update();

}

document
.getElementById("apiFilter")
.addEventListener("change", function(){

    updateApiChart(
        this.value
    );


});
