# Content Download

The `content_download` worker shows how you can share data from a worker. 

This is useful if you have a worker that generates some sort of content you want to share with other applications (or users). 

For example, suppose you have a worker that logs temperature or other data to a file as your vehicle is flying around, and you want to make it available to the user. 

You would initiate a content-download message to tell Solex to request a download. Then your `onContentDownload()` function would be called with the data you told Solex to send (filename, MIME type, etc) and you'd supply the data for the download. Solex would retrieve the file, save it locally, and then attempt to share it with other applications on the device it's running on.

## UI

The UI in this sample has two buttons on it. The one on the Start screen shows how to display a dialog letting the user pick a particular piece of content to download. Once they pick an item, it's downloaded to the device and a "Share" screen appears to handle the file that was downloaded.

The one on the Flight screen just initiates a download directly.

## How it works

In the Start screen example, the worker shows the selection dialog by sending a `content_dialog` message and providing a unique `dialog_id` attribute in the message. The `list_items` array in the JSON is where you would supply a pickable list of items to download. Note the `id` attribute in each item. This value should be unique within the list of items.

When the user picks an item, the worker originating the `content_dialog` message is called with the `msg_id` specified in the picked list item. The `id` of the picked item is passed in the `item_id` attribute of the message, so your worker can identify the item to download.

In response, the worker sends a `content_download` message back to the client specifying which item to download, its MIME type, filename to save the content to, and a `msg_id` to pass when requesting the download.

Upon getting this message, Solex calls the `/worker-download` endpoint in SolexCC with this information. The request is passed to the worker, which supplies the appropriate content based on what item was requested. 

Simple!

## Handling content downloads

A worker supplies downloaded content by implementing/exporting the `onContentDownload(msgId, contentId)` function. It can do this by returning actual file content as a `Buffer`, or it can generate the content dynamically. This example "generates" it by just returning a string with the selected item id in it as its return value.



