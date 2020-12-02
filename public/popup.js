window.onload = ()=> {
	if (window.opener == null) {
		document.body.append('No way to access parent window as the window.opener is null');	
	} else {
		document.body.append(`Have access to parent window, the title is ${window.opener.document.title}`);	
	}
}
