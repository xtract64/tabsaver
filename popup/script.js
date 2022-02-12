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

            let button = document.createElement('button')
            button.innerText = 'Load'
            button.id = 'group-'+ i

            d.append(name)
            d.append(button)
            d.setAttribute('class', 'tabGroup')
            
            tabDiv.append(d)

            document.getElementById('group-'+ i).addEventListener('click', async () => {
                storage = await browser.storage.sync.get();
                groups = storage.tabGroups;

                var urls = groups[i].urls;

                browser.windows.create({ url: urls })
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