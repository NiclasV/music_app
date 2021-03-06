//Class & constructor for our fetches with methods for specific or general requests
class getData {
    constructor(limit){
        this.limit = limit;
        this.baseUrl = "https://folksa.ga/api/tracks";
        this.key = "key=flat_eric";
    }
    General() {
        return fetch(this.baseUrl + "?limit=" + this.limit + "&" + this.key)
        .then((response) => response.json())
    }
    Specific(id) {
        return fetch(this.baseUrl + this.type + "/" + id + "?" + this.key)
        .then((response) => response.json())
    }
}

//Class & Constructor for creating tracks to the ultimatePlaylist
class track {
    constructor(artist, name, id) {
        this.artist = artist;
        this.name = name;
        this.id = id;
    }
}

//Creating a module to handle tracks and localStorage
const handleTracks = {

    checkLocalStorage: function() {
        //this is the first thing thats bound to happen when loading the site
        //check if there are tracks saved in localStorage, if not create the playlist and a track as an example
        const ultimatePlaylist = JSON.parse(localStorage.getItem('ultimatePlaylist'));

        if(!ultimatePlaylist) {
            const ultimatePlaylist = []; //Define ultimatePlaylist that will collect all the tracks
            localStorage.setItem("ultimatePlaylist", JSON.stringify(ultimatePlaylist)); //Save it to localStorage
        }
    },
    
    addTrack: function(title, name, id) {
        const ultimatePlaylist = JSON.parse(localStorage.getItem('ultimatePlaylist'));
        let newTrack = new track(title, name, id)
        ultimatePlaylist.push(newTrack) //Push the track to the ultimatePlaylist array
        localStorage.setItem("ultimatePlaylist", JSON.stringify(ultimatePlaylist)); //Save it to localStorage
        modifierController.replaceAddButton(id)
    },

    removeTrack: function(id) {
        const ultimatePlaylist = JSON.parse(localStorage.getItem('ultimatePlaylist'));

        //Get the index of the song to delete based on its unique id
        var index = ultimatePlaylist.findIndex(function(element){return element.id === id}) 
        
        ultimatePlaylist.splice(index, 1); 
        //When deleted from the array, update localstorage
        localStorage.setItem("ultimatePlaylist", JSON.stringify(ultimatePlaylist));
        location.reload() 
    }
}

const displayController = {

    searchResultTracks: function(data) {
        let displaySearchedResult = document.getElementById("searchResults");
        let content = `<h2>Search results</h2> `; 
        for (let track of data) {
            let title = track.title
            let id = track._id;

            for(let artist of track.artists) {
                let name = artist.name
                
                content += `
                <li class="search-results">${title} - ${name} <button onclick="handleTracks.addTrack(this.dataset.title, this.dataset.name, this.id)" 
                data-title="${title}" data-name="${name}" id="${id}" class="btn-sm btn-outline-primary add-track-button">Add track</button></li>
                `; 
                displaySearchedResult.innerHTML = content;
            }   
        }
    },
    
    playlist: function() {
        const ultimatePlaylist = JSON.parse(localStorage.getItem('ultimatePlaylist'));
        const playlists = document.getElementById("playlists");
        let content = ``;
        
        for ( let song of ultimatePlaylist ) {
            content += `
            <tr>
            <td>${song.artist}</td>
            <td>${song.name}</td>
            <td><button id="${song.id}" onclick="handleTracks.removeTrack(this.id)" 
            class="btn btn-outline-danger delete-track-button">X</button></td>
            </tr>
            `
        }
        playlists.innerHTML = content;
    }
}

const modifierController = {

    replaceAddButton: function(id) {
        //This is to create some feedback when adding a track
        //and so that you cant add the same over and over,
        //replacing the addbutton with a badge saying "track added"
        let addBtn = document.getElementById(id);
        let span = document.createElement('span');
        span.classList.add("badge-primary", "badge");
        span.innerText = "TRACK ADDED!";

        addBtn.replaceWith(span) //Switch the button to the badge
    },
}

//I know we should have implemented the below function in a module as a method 
//I hope its ok if we're leaving it hanging in the global scope this time!
const nameInput = document.querySelector('#search-form');
nameInput.addEventListener('input', searchTracks);

    // RÅ DATA Api
    function searchTracks(){
        let name = nameInput.value;
        const spinner = document.getElementsByClassName('spinner')[0];

        const url = 'https://folksa.ga/api/tracks?limit=1000&key=flat_eric';
        if(name.length >= 1) { spinner.classList.remove('hidden') 
        } else if (name.length === 0 ) { spinner.classList.add('hidden') 
        }
        if(name.length >= 3){ 
            if ('caches' in window) {
                caches.match(url).then(function(response) {
                  if (response) {
                    response.json().then(function updateFromCache(json) {
                    let results = json;
                    results = results.filter( ( item ) => {
                    return new RegExp( name, 'ig' ).test( item.title )
                    });
                    results.created = new Date();
                    displayController.searchResultTracks(results);
                    console.log('Here comes the cache data' + results)
                });
            }
        });
    }  
            fetch(url)
            .then(response => response.json())
            .then( data => {
                data = data.filter( ( item ) => {
                return new RegExp( name, 'ig' ).test( item.title )
            });
            displayController.searchResultTracks(data);
            console.log('Fetch data!!!')
            })
            .catch(err => console.log(err)); 
        }
    }



//Launch localStorage-check
handleTracks.checkLocalStorage()
//Display the playlist
displayController.playlist()

//Hello little service-worker!
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
    .register('/service-worker.js')
    .then(function() { console.log('Service Worker Registered'); });
}