# Rufus Livereload
Develop in local machine reflecting SharePoint site at real time.

### Live reload experience
Develop... Save... Enjoy!
By running Rufus Serve Task, you can write scripts locally and check changes directly on SharePoint site. All changes dected in local files will reflects the target folder.

### Usage
Install using npm:
```shell
$ npm install rufus-livereload
```

In Node.js:
```js
const rufus = require('rufus-livereload').rufus;

async function sync(options) {
	await rufus(options).sync();
}

async function serve(options) {
	await rufus(options).serve();
	//Note that serve is a promise that never resolve
}

async function syncThenServe(options) {
	await sync(options);
	await serve(options);
} 
```
In client:
```html
<script src="http://localhost:5051/rufus-client.js" type="text/javascript"></script>
```
### Usage with gulp
Typically, rufus is used with gulp due to facility to run tasks.
```js
const rufus = require('rufus-livereload').rufus;
const rufusOptions = require('rufus.config.json');

async function serveTask() {
	await rufus(rufusOptions).serve();
}

exports.serve = serveTask;
```
###Sync and Serve
- **sync** is responsible to sync local files in SharePoint folder. Even powerful, sync is very simple, its just erase target folder in SharePoint and recreate it uploading local files.
- **serve** is the watcher. Any local change detected while serve is running is passed to the server. The serve can *update*, *add* and *delete* files and folders.

###Options
- **localPath**&nbsp;&nbsp;&nbsp;`string` `required`
Local folder or file to watch changes. Rufus will build exactly same folder structure to the SharePoint. Note that empty flocal olders will not be uploaded.

- **webStaticPort**&nbsp;&nbsp;`int`
Port used to create server for static files requested by client.
Default is **5051**.

- **webSocketPort**&nbsp;&nbsp;`int`
Port used to create server for webscoket communication for real time client reload. Page reload will run automatically after any change are detected and upload performed.
Default is **8081**. 
- **sharePointUrl**&nbsp;&nbsp;`string` `required`
URL SharePoint site.

- **sharePointFolder**&nbsp;&nbsp;`string` `required`
Relative URL for folder in SharePoint URL.

- **sharePointWorkingUrl**&nbsp;&nbsp;`string`
If informed, Rufus will open this URL in browser when Rufus Watch is ready. When omitted, you need to open browser in site working page that client script was inserted after Rufus Watch is ready due to the fact that WebSocket connection is established in page load.

- **username**&nbsp;&nbsp;`string` `required`
Username to login in SharePoint.

- **password**&nbsp;&nbsp;`string` `required`
Password to login in SharePoint. If you use two-step verification please visit [Using app passwords with apps that don't support two-step verification](https://support.microsoft.com/en-us/help/12409/microsoft-account-app-passwords-and-two-step-verification).

Opions usage example:
```
const rufusOptions = {
	localPath: './src',
	webStaticPort: 5051,
	webSocketPort: 8081,
	sharePointUrl: 'https://trentim.sharepoint.com/sites/subsite',
	sharePointFolder: 'Shared Documents/Subfolder',
	sharePointWorkingUrl: 'https://myurl.sharepoint.com/sites/subsite/Project%20Detail%20Pages/WorkflowStageStatus.aspx?ProjUid=1',
	username: 'myusername@myemail.com',
	password: '**********'
};
```
****
