class Login {
	constructor(onSuccess, miniauthLogin, miniauthCreate, appName) {
		let isInLoginMode = true;
		let isSendingRequest = false;
		let linkButtonModification = "text-decoration: underline; background:none!important; border:none; color:#069; cursor:pointer;"
		let title = CreateLabel("Login Required");
		new ExplicitStyle("width: 300; Height: 40; font-size: 30; -webkit-order: 0; order: 0;").attach(title);
		
		let username = CreateTextInput();
		let usernameStyle = new CssStyle("padding: 5px; width: 300; Height: 40; font-size: 30; -webkit-order: 1; order: 1; border: 2px solid #000000;");
		new ExplicitStyle(usernameStyle).attach(username);
		new LostFocusEvent((_) => {
			usernameStyle["border"] = username.getElement().value.length > 0 ? "2px solid #0066FF;": "2px solid #FF0000;";
			new ExplicitStyle(usernameStyle).attach(username);
		}).attach(username);
		
		let password = CreatePasswordInput();
		let passwordStyle = new CssStyle("padding: 5px; width: 300; Height: 40; font-size: 30; border: 2px solid #000000;");
		new ExplicitStyle(passwordStyle).attach(password);
		new InputEvent((_) => passwordLength.getElement().innerHTML = password.getElement().value.length ).attach(password);
		new LostFocusEvent((_) => {
			passwordStyle["border"] = password.getElement().value.length > 0 ? "2px solid #0066FF;": "2px solid #FF0000;";
			new ExplicitStyle(passwordStyle).attach(password);
			if(passwordEchoStyle["border"] != "2px solid #000000"){
				passwordEchoStyle["border"] = passwordEcho.getElement().value == password.getElement().value ? "2px solid #0066FF;": "2px solid #FF0000;";
				new ExplicitStyle(passwordEchoStyle).attach(passwordEcho);
			}
		}).attach(password);
		
		let passwordLength = CreateLabel("0");
		new ExplicitStyle("border-left: 5px solid #FFFFFF; Height: 40; font-size: 30;").attach(passwordLength);
		
		let passwordContainer = CreateContainer([password, passwordLength]);
		new ExplicitStyle("Height: 40; -webkit-order: 2; order: 2;").attach(passwordContainer);
		
		let passwordEcho = CreatePasswordInput();
		let passwordEchoStyle = new CssStyle("padding: 5px; width: 300; Height: 40; font-size: 30; border: 2px solid #000000;");
		new ExplicitStyle(passwordEchoStyle).attach(passwordEcho);
		new InputEvent((_) => passwordEchoLength.getElement().innerHTML = passwordEcho.getElement().value.length ).attach(passwordEcho);
		new LostFocusEvent((_) => {
			passwordEchoStyle["border"] = passwordEcho.getElement().value == password.getElement().value ? "2px solid #0066FF;": "2px solid #FF0000;";
			new ExplicitStyle(passwordEchoStyle).attach(passwordEcho);
		}).attach(passwordEcho);
		
		let passwordEchoLength = CreateLabel("0");
		new ExplicitStyle("border-left: 5px solid #FFFFFF; Height: 40; font-size: 30;").attach(passwordEchoLength);
		
		let passwordEchoContainer = CreateContainer([passwordEcho, passwordEchoLength]);
		let passwordEchoContainerStyle = new CssStyle("Height: 40; -webkit-order: 3; order: 3; display: none;");
		new ExplicitStyle(passwordEchoContainerStyle).attach(passwordEchoContainer);
		
		let login = CreateButton((_) => {
			if(isInLoginMode){
				if(username.getElement().value.length == 0 || password.getElement().value.length == 0){
					error.getElement().innerHTML = "Invalid fields are marked red";
					username.getElement().onblur();
					password.getElement().onblur();
				}
				else if(!isSendingRequest){
					let xmlHttp = new XMLHttpRequest();
					isSendingRequest = true;
					xmlHttp.onload = function() {
						isSendingRequest = false;
						if(xmlHttp.status > 499)
							error.getElement().innerHTML = "Server error"
						else if(xmlHttp.status > 399)
							error.getElement().innerHTML = "Combination incorrect";
						else{
							let obj = JSON.parse(xmlHttp.responseText);
							let cookie = "Token=" + obj["Token"] + ";" + new Date(obj["ExpiresAtUtc"] * 1000).toUTCString();
							document.cookie = cookie;
							console.log("Added cookie: " + cookie);
							console.log('Ignore next "Form submission canceled because the form is not connected" warning')
							loginForm.die();
							onSuccess();
						}
					}
					xmlHttp.onerror = function() {
						isSendingRequest = false;
						error.getElement().innerHTML = "Failed to connect"
					}
					xmlHttp.open("POST", miniauthLogin, true);
					xmlHttp.send(JSON.stringify({ "username": username.getElement().value, "password": password.getElement().value, "appname": appName }));
				}
			}
			else{
				isInLoginMode = true;
				loginStyle["-webkit-order"] = "3";
				loginStyle["order"] = "3";
				new ExplicitStyle(loginStyle).attach(login);
				new ExplicitStyle(createAccountStyle + linkButtonModification).attach(createAccount);
				passwordEchoContainerStyle["display"] = "none";
				new ExplicitStyle(passwordEchoContainerStyle).attach(passwordEchoContainer);
			}
		});
		let loginStyle = new CssStyle("width: 300; Height: 40; font-size: 30; -webkit-order: 3; order: 3;");
		new ExplicitStyle(loginStyle).attach(login);
		new Text("Login").attach(login);
		
		let createAccount = CreateButton((_) => {
			if(isInLoginMode){
				isInLoginMode = false;
				loginStyle["-webkit-order"] = "5";
				loginStyle["order"] = "5";
				new ExplicitStyle(loginStyle + linkButtonModification).attach(login);
				new ExplicitStyle(createAccountStyle).attach(createAccount);
				passwordEchoContainerStyle["display"] = "block";
				new ExplicitStyle(passwordEchoContainerStyle).attach(passwordEchoContainer);
			}
			else{
				if(username.getElement().value.length == 0 || password.getElement().value.length == 0 || password.getElement().value != passwordEcho.getElement().value){
					error.getElement().innerHTML = "Invalid fields are marked red";
					username.getElement().onblur();
					password.getElement().onblur();
					passwordEcho.getElement().onblur();
				}
				else{
					let xmlHttp = new XMLHttpRequest();
					isSendingRequest = true;
					xmlHttp.onload = function() {
						isSendingRequest = false;
						if(xmlHttp.status > 499)
							error.getElement().innerHTML = "Server error"
						else if(xmlHttp.status > 399){
							error.getElement().innerHTML = "Username already taken";
							usernameStyle["border"] = "2px solid #FF0000;";
							new ExplicitStyle(usernameStyle).attach(username);
						}
						else{
							let xmlHttp = new XMLHttpRequest();
							isSendingRequest = true;
							xmlHttp.onload = function() {
								isSendingRequest = false;
								if(xmlHttp.status > 399){
									error.getElement().innerHTML = "Failed to login with new account"
								}
								else{
									let obj = JSON.parse(xmlHttp.responseText);
									let cookie = "Token=" + obj["Token"] + ";" + new Date(obj["ExpiresAtUtc"] * 1000).toUTCString();
									document.cookie = cookie;
									console.log("Added cookie: " + cookie);
									console.log('Ignore next "Form submission canceled because the form is not connected" warning')
									loginForm.die();
									onSuccess();
								}
							}
							xmlHttp.onerror = function() {
								isSendingRequest = false;
								error.getElement().innerHTML = "Failed to connect"
							}
							xmlHttp.open("POST", miniauthLogin, true);
							xmlHttp.send(JSON.stringify({ "username": username.getElement().value, "password": password.getElement().value, "appname": appName }));
						}
					}
					xmlHttp.onerror = function() {
						isSendingRequest = false;
						error.getElement().innerHTML = "Failed to connect"
					}
					xmlHttp.open("POST", miniauthCreate, true);
					xmlHttp.send(JSON.stringify({ "username": username.getElement().value, "password": password.getElement().value }));
				}
			}
		});
		let createAccountStyle = new CssStyle("width: 300; Height: 40; font-size: 30; -webkit-order: 4; order: 4;");
		new ExplicitStyle(createAccountStyle + linkButtonModification).attach(createAccount);
		new Text("Create Account").attach(createAccount);
		
		let error = CreateLabel("");
		let errorStyle = new CssStyle("width: 400; Height: 40; font-size: 30; -webkit-order: 6; order: 6; color: #FF0000;");
		new ExplicitStyle(errorStyle).attach(error);
		
		let loginForm = CreateForm([title, username, passwordContainer, passwordEchoContainer, login, createAccount, error]);
		new ExplicitStyle("display: -webkit-flex; display: flex; -webkit-flex-direction: column;").attach(loginForm);
		
		document.body.appendChild(loginForm.arise());
		
		username.getElement().placeholder = "Username";
		password.getElement().placeholder = "Password";
		passwordEcho.getElement().placeholder = "Same Password";
    }
}

class CssStyle {
	constructor(string) {
		let properties = string.split(";");
		for(let i = 0; i < properties.length - 1; i++) {
			let keyPair = properties[i].split(":");
			this[keyPair[0].trim()] = keyPair[1].trim();
		}
	}
	
	//For single adding, modifying, or removal use this as an Object
	
	addCss(string){
		let properties = string.split(";");
		for(let i = 0; i < properties.length - 1; i++) {
			let keyPair = properties[i].split(":");
			this[keyPair[0].trim()] = keyPair[1].trim();
		}
	}
	
	removeMultiple(array){
		for(let i = 0; i < array.length; i++)
			delete this[array[i]];
		console.log(this.toString());
	}
	
	toString() {
		let string = "";
		for(let key in this)
			string += key + ": " + this[key] + "; ";
		return string;
	}
}