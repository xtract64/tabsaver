document.addEventListener('DOMContentLoaded', async function() {
    var manifest = await browser.runtime.getManifest()
    document.getElementById('version').innerText = 'v'+ manifest.version
    document.getElementById('title').innerText = manifest.name

    var storage = await browser.storage.sync.get()
    var groups = storage.tabGroups
    if (!groups) browser.storage.sync.set({ 'tabGroups': [] })

    storage = await browser.storage.sync.get()
    groups = storage.tabGroups

    async function loadGroups() {
        storage = await browser.storage.sync.get()
        groups = storage.tabGroups
    
        //document.getElementById('tutorial').remove()
        var tabDiv = document.getElementById('tabs')
        tabDiv.innerHTML = ''
        
        if (groups.length < 1) {
            document.getElementById('tutorial').hidden = false
            return;
        } else
            document.getElementById('tutorial').hidden = true

        for (let i = 0; i < groups.length; i++) {
            let d = document.createElement('div')
            
            let name = document.createElement('p')
            name.innerText = groups[i].name

            let vr = document.createElement('div')
            vr.setAttribute('class', 'vr')

            let loadimg = document.createElement('img')
            loadimg.src = '/assets/icons/load.png'
            let loadbutton = document.createElement('button')
            loadbutton.setAttribute('class', 'circle small')
            loadbutton.id = 'group-'+ i+ '-load'
            loadbutton.append(loadimg)

            let delimg = document.createElement('img')
            delimg.src = '/assets/icons/trash-lines.png'
            let delbutton = document.createElement('button')
            delbutton.setAttribute('class', 'circle small')
            delbutton.id = 'group-'+ i+ '-del'
            delbutton.append(delimg)

            d.append(name)
            d.append(vr)
            d.append(loadbutton)
            d.append(delbutton)
            d.setAttribute('class', 'tabGroup')
            
            tabDiv.append(d)

            document.getElementById('group-'+ i+ '-load').addEventListener('click', async () => {
                storage = await browser.storage.sync.get();
                groups = storage.tabGroups;

                var urls = groups[i].urls;

                browser.windows.create({ url: urls })
            })

            document.getElementById('group-'+ i+ '-del').addEventListener('click', async () => {
                storage = await browser.storage.sync.get();
                storage.tabGroups.splice(i, 1);

                browser.storage.sync.set(storage);
                loadGroups()
            })
        }
    }

    loadGroups()

    document.getElementById('sync-tabs').addEventListener('click', async () => {
        let tabInfo = await browser.windows.getAll({
            populate: true,
            windowTypes: ["normal"]
        });
        let tabs = tabInfo[0].tabs;

        let urls = [];
        tabs.forEach((value, index) => {
            if (value.url.startsWith('https://') || value.url.startsWith('http://')) urls.push(value.url);
        });

        storage = await browser.storage.sync.get();
        groups = storage.tabGroups;

        let name = document.getElementById('group-name').value;
        groups[groups.length] = { name, urls };
        browser.storage.sync.set({ 'tabGroups': groups });

        loadGroups();
    });

    document.getElementById('clear-tabs').addEventListener('click', async () => {
        browser.storage.sync.set({ 'tabGroups': [] });

        loadGroups();
    });

    document.getElementById('settings').addEventListener('click', () => {
        window.open('/settings.html')
    });
});