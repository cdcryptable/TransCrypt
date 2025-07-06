//MATH ALGO BBP

function pi_ser(j, n, prec){
    /*
    Calcule la somme des 16^(n-k)/(8k + j) pour k allant de 0 à D
    où D est une valeur de sécurité assure une certaine précision des décimales jusqu'au rang n + prec

    On travaille avec des bigint puisqu'on se retrouve avec des nombres d'au moins prec chiffres hex, soit 4prec chiffres binaires.
    La limite des entiers normalement utilisés en javascript est 2^53 - 1, (attribut publique MAX_SAFE_INTEGER de la classe Number)
     */

    let D = BigInt(pi_dn(n, prec));
    let D4 = 4n*D;//Pour faire des "bitshifts" de base 16;
    n = BigInt(n);

    let d = BigInt(j); //denominateur
    let s = 0n; // somme

    // Comme on s'intéresse uniquement aux décimales à partir du rang n, on peut calculer sous modulo les premiers membres de la somme
    for (var k = 0n; k < n+1n ; k++){
        s += (((16n**(n-k))%d)<<D4)/d; //
        d += 8n;
    }

    let t = 0n;
    let e = D4 - 4n;
    d = 8n*k + BigInt(j);

    //On continue de sommer jusqu'à ce que les membres de la somme soit
    while(true){
        let dt = (1n<<e)/d;
        if (!dt){
            break;
        }
        t += dt;
        e -= 4n;
        d += 8n;
    }
    return (s + t) ;
}

function pi_hex(n, prec){
    /*
    calcul avec BBP : on obtient un bandeau de pi de longueur prec débutant à la position n, en hexadécimal
     */
	n=Math.abs(Math.floor(n));
	prec=Math.abs(Math.floor(prec));
	n-=1;
	let a=[4n,2n,1n,1n]; //coef de séries dans BBP
	let j=[1n,4n,5n,6n];
	let D = BigInt(pi_dn(n, prec));
	//n = BigInt(n);
	let x = (a[0]*pi_ser(j[0], n, prec)
        - a[1]*pi_ser(j[1], n, prec)
        - a[2]*pi_ser(j[2], n, prec)
        - a[3]*pi_ser(j[3], n, prec)
        ) & (16n**D - 1n);

    prec = BigInt(prec);
	x = x / 16n**(D - prec);
	x = x.toString(16);
	return x;
}


function pi_dn(n,prec){
    /*
    Calcul de D qui va assurer la précision des décimales du calcul de pi jusqu'au rang n+prec+1
     */
	return Math.floor(Number(Math.log(n + prec + 1)/Math.log(16) + prec + 3));
}

//TRANSCRYPT

 function xor_two_str(a,b){
     /*
     Applique l'opérateur ou exclusif entre deux châines de caractères : a msg direct en str(caractères ascii)et b hexa en str après calculs
     */
     let xored = "";
     for (let i = 0; i < a.length;i++){
     	// char code at donne valeur du code ascii du caractère entre parenthèses
         let u = (a.charCodeAt(i)^b.charCodeAt(i%b.length));//xor puis conversion en hex
         u = u.toString();
        let c = String.fromCharCode(u);
         xored = xored + c;

     }
     return xored;
 }


function crypt(clef, msg){
    /*
    Applique transcrypt à msg avec une clef donnée
     */
    return xor_two_str(msg,pi_hex(clef, msg.length)); // renvoie le message chiffré
 }

function decrypt(clef, msg){
    /*
    Inverse de crypt.
     */
    return xor_two_str(msg, pi_hex(clef, msg.length));
 }
//VARIABLES GLOBALES

var userid;
var usercode;
var keys = {};
var lastInputLetterCode = 13;
let couleur = "#760000";


function initialisation () {
	/*
	Fonction appelée lors du chargement de la page.
	Elle adapte le css aux dimensions de la page, et fait une requête au serveur pour obtenir un identifiant et un code
	'secret', afin que le serveur puisse vérifier, lors des échanges futurs, que l'identité du client n'est pas usurpée.
	Aucun paramètre n'est utilisé.
	 */

	document.getElementById("contenuContact").style.maxHeight = window.innerHeight - 100 + "px";
	document.getElementById("contenuMessage").style.maxHeight = window.innerHeight - 257 + "px";
	document.getElementById("contenuMessage").style.minHeight = window.innerHeight - 257 + "px";
	document.getElementById("pageListeUtilisateurs").style.display = "none";
	

	$.ajax({
		type: "POST",
  		url: "/getid",
  		contentType: "application/json",
		async:false,
  		dataType: 'json',
  		success: function(result) { //un dictionnaire de la forme {"userid": , "usercode": }
  			userid = result["userid"];
  			usercode = result["usercode"];
  			document.getElementById("nameUser").value = "User_"+userid;
  		} 
	});
}


// FONCTIONS CLIENT SEUL


function nouvelleTaille () {
	/*
	Fonction appelée dès que la fenêtre change de taille ou que le client saisi un nouveau caractère lors de la
	composition de son message.
	Elle adapte la taille de la conversation et de la liste des contacts,à la taille de la fenêtre et du message en
	cours de rédaction. Elle assure aussi la transition entre les différents modes d'affichage (écran large et écran fin)
	Aucun paramètre n'est utilisé.
	*/


	document.getElementById("contenuContact").style.maxHeight = window.innerHeight - 100 + "px";
	let tailleInput = document.getElementById("messageAEnvoyer").scrollHeight;
	let tailleSpan = document.getElementById("envoyerMessage").style.height;

	if (tailleInput>200){
		document.getElementById("contenuMessage").style.maxHeight = window.innerHeight - parseInt(tailleSpan.slice(0, -1)) -177 + "px";
		document.getElementById("contenuMessage").style.minHeight = window.innerHeight - parseInt(tailleSpan.slice(0, -1)) -177 + "px";
	}
	else {
		document.getElementById("contenuMessage").style.maxHeight = window.innerHeight - tailleInput - 208 + "px";
		document.getElementById("contenuMessage").style.minHeight = window.innerHeight - tailleInput - 208 + "px";
	}

	if (window.innerWidth > 630){
		document.getElementById("main").style.display = "initial";
		document.getElementById("contenuContact").style.display = "initial";
	}
	else if (document.getElementById("main").style.display != "none"
		&& document.getElementById("contenuContact").style.display != "none"){
		document.getElementById("main").style.display = "initial";
		document.getElementById("contenuContact").style.display = "none";

	}

	if (window.innerHeight <= 530) {
		afficherListeConversations();
	}
}



function changeArea(){
	/*
	Fonction appelée lorsque le bouton d'id "boutonRetour" est cliqué.
	Elle permet de retourner à la liste des contacts, lorsque la messagerie est utilisée sur un écran ou une fenêtre mince.
	Aucun paramètre n'est utilisé.
	*/

	document.getElementById("main").style.display = "none";
	document.getElementById("contenuContact").style.display = "initial";t
}



function afficherConversationContact (e) {
	/*
	Fonction appelée lorsque l'on clique sur le bouton associé à un  contact, lorsque le client ouvre une nouvelle
	conversation avec un autre utilisateur et lorsque le client reçoit un message.
	Elle permet de modifier le css d'un bouton associé à un contact, lorsqu'il est cliqué, d'afficher la conversation
	avec ce contact, et de définir ce contact comme cible du prochain message (première ligne de la fonction).
	Le paramètre "e" est l'id du bouton associé au contact d'identifiant e.slice(0, -4)
	 */

	document.getElementById("messageAEnvoyer").dataCible = e.slice(0, -4);

	let listeContacts = document.querySelectorAll(".caseContact");
	listeContacts.forEach(function(userId) {
			document.getElementById(userId.getAttribute("id")).style.backgroundColor = "#1F1F1F";
	});
	document.getElementById(e).style.backgroundColor = "#540000";

	let listeDiscussions = document.querySelectorAll(".convContainers");
	listeDiscussions.forEach(function(userId) {
			document.getElementById(userId.getAttribute("id")).style.display = "none";
	});
	document.getElementById(e.slice(0, -4)).style.display = "initial";

	document.getElementById("barreContact").innerHTML = "User_"+e.slice(0, -4);

	document.getElementById("contenuMessage").scrollTo(0, document.getElementById("contenuMessage").scrollHeight);

	if (window.innerWidth <= 630){
		document.getElementById("contenuContact").style.display = "none";
		document.getElementById("main").style.display = "initial";
	}

	if (couleur == "#760000") {
    	orange();
    }
    else if (couleur == "#005DDD") {
    	bleu();
    }
    else if (couleur == "#288A00") {
    	vert();
    }
    else {
    	blanc();
    }
}



function afficherContact (nom, lastMessage){
	/*
	Fonction appelée lorsque le client ouvre une nouvelle conversation avec un autre utilisateur, et lorsque le client
	reçoit un message d'un utilisateur avec qui il n'a jamais conversé.
	Elle permet de créer dans la liste des contacts, un nouveau bouton cliquable associé à l'utilisateur "nom".
	Le paramètre "nom" est l'identifiant du contact que représente le bouton et "lastMessage" est le dernier message
	échangé avec ce contact.
	 */

    let boxContact = document.createElement("div");
    let nameContact = document.createElement("h1");
    let latestWord = document.createElement("p");

    boxContact.setAttribute("id", nom + "case");
    boxContact.setAttribute("onclick", "afficherConversationContact(this.id)");
    boxContact.setAttribute("class", "caseContact");
    nameContact.setAttribute("class", "nomContact");
    latestWord.setAttribute("class", "derniersMots");
    latestWord.setAttribute("id", "derniersMots"+nom);

    nameContact.appendChild(document.createTextNode("User_"+nom));
    latestWord.appendChild(document.createTextNode(lastMessage));

    boxContact.appendChild(nameContact);
    boxContact.appendChild(latestWord);

    document.getElementById("contenuContact").appendChild(boxContact);

    document.getElementById("messageAEnvoyer").dataCible = nom;

    if (couleur == "#760000") {
    	orange();
    }
    else if (couleur == "#005DDD") {
    	bleu();
    }
    else if (couleur == "#288A00") {
    	vert();
    }
    else {
    	blanc();
    }
}



function newConv (id) {
	/*
	Fonction appelée lorsque le client ouvre une nouvelle conversation avec un autre utilisateur, et lorsque le client
	reçoit un message d'un utilisateur avec qui il n'a jamais conversé.
	Elle permet de créer un espace de discussion avec le nouveau contact, et avec le message introducteur (qui rappelle
	que l’échange est crypté). Elle appelle aussi les fonctions afficherContact et afficherConversationContact.
	Le paramètre "nom" est l'identifiant du nouveau contact.
	*/

	document.getElementById("idNouveauContact").value = "";
	let messageIntro = document.createElement("div");
	messageIntro.setAttribute("class", "messageIntro");
	messageIntro.appendChild(document.createTextNode("Cette conversation est sécurisée"));
	let convContainer = document.createElement("div");
	convContainer.setAttribute("id", id);
	convContainer.setAttribute("class", "convContainers");
	convContainer.appendChild(messageIntro);
	document.getElementById("contenuMessage").appendChild(convContainer);
	afficherContact(id, "");
	let sentIdUser = id+"case";
	afficherConversationContact(sentIdUser);
}



function afficherMessage (me, others, valeur){
	/*
	Fonction appelée lorsque le client reçoit ou envoie un message.
	Elle permet d’afficher les messages envoyés et reçus et d’adapter le bouton associé à l’utilisateur avec lequel se
	passe l’échange. Lorsque le client reçoit le premier message d’un autre utilisateur, la fonction appelle la
	fonction newConv.
	Le paramètre "me" prend la valeur 1 lorsque l’auteur du message est le client.
	Le paramètre "others" est l’identifiant de l’utilisateur avec lequel le client interagit.
	Le paramètre "valeur" est le contenu du message.
	*/

	let booleen = false;
	let listeDiscussions = document.querySelectorAll(".caseContact");
	listeDiscussions.forEach(function(userId) {
		let idDiscussion = userId.getAttribute("id");
  		if (idDiscussion.slice(0, -4) == others) {
  			booleen = true;
  		}
	});

	if (booleen == false) {
		newConv(others);
	}

    let myMessage = document.createElement("p");
    let myContainer = document.createElement("article");

	if (me==1){
		myMessage.setAttribute("class", "fromUser");
      	myContainer.setAttribute("class", "rightContainer");
	}
	else {
		myMessage.setAttribute("class", "toUser");
      	myContainer.setAttribute("class", "leftContainer");
	}

    myMessage.appendChild(document.createTextNode(valeur));

    myContainer.appendChild(myMessage);

    document.getElementById(others.toString()).appendChild(myContainer);

    document.getElementById("derniersMots"+others).innerHTML = valeur;

    afficherConversationContact(others+"case");

    document.getElementById("contenuMessage").scrollTo(0, document.getElementById("contenuMessage").scrollHeight);

    if (couleur == "#760000") {
    	orange();
    }
    else if (couleur == "#005DDD") {
    	bleu();
    }
    else if (couleur == "#288A00") {
    	vert();
    }
    else {
    	blanc();
    }
}


function boutonSend (){
	if (lastInputLetterCode != 13){
		sendToServeur();
		lastInputLetterCode = 13;
	}
}


function sendInJs(cible, message) {
	/*
	Fonction appelée si l’envoie du message au serveur se déroule bien.
	Elle permet de vider la barre de saisie du message qui a été envoyé, d'y adapter la mise en page grâce à la fonction
	nouvelleTaille, et d’afficher ce message grâce à la fonction afficherMessage.
	Le paramètre "cible" est l’identifiant du destinataire du message et "message" est la string du message envoyé.
	*/

	afficherMessage(1, parseInt(cible), message);

	document.getElementById("messageAEnvoyer").value="";
	nouvelleTaille();
}


function clean(e){
	/*
	Fonction appelée après l'envoi d'un message
	Réinitialise la barre d'envoi.
	Le paramètre "e" est la touche que le client presse dans le champ dédié à la recherche de nouveaux contacts.
	 */
	if(e.keyCode==13){
		document.getElementById("messageAEnvoyer").value="";
		document.getElementById("envoyerMessage").style.height = "80px";
		document.getElementById("contenuMessage").style.maxHeight = window.innerHeight - 257;
		nouvelleTaille();
	}
}


//FONCTIONS CLIENT-SERVEUR



function sendToServeur(){
	/*Fonction appelée lorsque le client presse la touche Entrer ou appuie
			 sur le bouton d’envoi du message.
	Elle permet d’envoyer le message et son destinataire au serveur, et 
			d’appeler sendInJs si l’opération est effectuée avec succès
	Aucun paramètre n'est utilisé. */
	let clair = document.getElementById("messageAEnvoyer").value;
	let cible = document.getElementById("messageAEnvoyer").dataCible;
	let key = keys[cible];
	let message = crypt(Math.floor(key/10000), crypt(key%10000, clair));

	$.ajax(	{
	type: "POST",
  	url: "/send",
	data: JSON.stringify({"userid":userid , "usercode":usercode , "to":cible , "msg":message, "key":"false"}),
  	contentType: "application/json",
  	dataType: 'json',
  	success: function (){
		sendInJs(cible, clair);
	},
	error: function (xhr, status, error){
		if (xhr.status == 403){
			window.location.href = "/expire"
		}
		if (xhr.status == 400){
			alert("Erreur 400 : L'utilisateur demandé n'existe pas");
		}
	}
});
}



function doesUserBe(id){
	/*
	Fonction appelée quand le client saisit un caractère dans le champ dédié à la recherche de nouveaux contacts, et que
	le client dont l’identifiant a été saisi, n’est pas dans les contacts du client.
	Elle permet de faire une requête au serveur afin de savoir si l’identifiant renseigné est associé a un client
	connecté au serveur.
	Le paramètre "id" est l’identifiant à rechercher.
	*/

	if (id != userid) {
		$.ajax({
			type:"POST",
			url : "/tobeornottobe",
			data : JSON.stringify({"id":id.toString()}),
			contentType : 'application/json',
			dataType : 'json', //le serveur renvoie un objet de la forme {"exists":} exists = O ou 1
			success : function(result){
				if (result["exists"] == 1){
					newConv(id);
				} else {
					alert("L'utilisateur " +  id.toString() + " n'existe pas");
				}
			}
		});
	}
}



function chercherNouveauContact(e) {
	/*Fonction appelée quand le client saisit un caractère dans le champ 
			dédié à la recherche de nouveaux contacts.
	Elle permet de regarder si l’utilisateur que le client recherche 
			est déjà dans sa liste de contact. S’il ne l’est pas, la 
			fonction doesUserBe est appelée lorsque le client presse 
			la touche Entrer.
	Le paramètre "e" est la touche que le client presse dans le champ 
			dédié à la recherche de nouveaux contacts. */

	let sentId = document.getElementById("idNouveauContact").value;
	let bool = false;

    	let listeDiscussions = document.querySelectorAll(".convContainers");

		listeDiscussions.forEach(function(userId) {
  			if (userId.getAttribute("id") == sentId) {
  				bool = true;
  			}
		});
	if((e.keyCode==13 || e == 13) && bool==false && sentId!=""){
		doesUserBe(parseInt(sentId));
	}
}



function getMessage(){
	/*
	Fonction appelée toute les secondes (cet intervalle pourrait être bien plus court mais en vue d’un déploiement à
	grande échelle, nous avons essayé de réduire le nombre de requetés au serveur).
	Elle permet de faire une requête au serveur afin de vérifier si un message a été envoyé au client. Si le message est
	une clef de communication, celle-ci est stockée du coté du client (et supprimée sur le serveur), sinon la fonction
	afficherMessage est appelée.
	Aucun paramètre n'est utilisé.
	*/

	$.ajax({
		type: "POST",
  		url: "/check",
		data:JSON.stringify({"userid": userid, "usercode":usercode} ),
  		contentType: "application/json",
  		dataType: 'json',
  		success: function(result) {
  			for (let i = 0 ; i < result.length ; i++){
  				if (result[i]["key"]=="true"){
  					keys[result[i]["id"]] = result[i]["msg"];
  				}
  				else {
					  let cible = result[i]["id"]
					  let key = keys[cible];
					  let cryp = result[i]["msg"];
					  let message = decrypt(key%10000, decrypt(Math.floor(key/10000), cryp));
					  afficherMessage(0,parseInt(cible),message);

  				}
  			}
  		},
		error: function () {
			window.location.href = "/expire";
		}
	});
}



function sendKey(){
	/*
	Fonction appelée juste avant l’envoie du premier message d’une conversation.
	Elle permet de générer et d’envoyer la clef de communication à l’autre utilisateur.
	Aucun paramètre n'est utilisé.
	 */

 	let key = Math.floor(Math.random() * 100000000); //10^8
  	let cible = document.getElementById("messageAEnvoyer").dataCible;
  	$.ajax( {
  		type: "POST",
	  	url: "/send",
	  	data: JSON.stringify({"userid":userid , "usercode":usercode , "to":cible , "msg":key, "key":"true"}),
	  	contentType: "application/json",
	  	dataType: 'json',
		async: false,
	  	success: function (){
	  		keys[cible] = key;
			  console.log(key)
		},
		error: function (xhr, status, error){
			  if (xhr.status == 403){
				  window.location.href = "/expire"
			  }
			  if (xhr.status == 400){
				  alert("Erreur 400 : L'utilisateur demandé n'existe pas");
			  }
		}
	});
}



function maybeSend(e) {
	/*
	Fonction appelée dès que le client saisi un nouveau caractère dans la barre dédiée à la composition du message.
	Elle permet d’échanger avec l’autre utilisateur une clef grâce à la fonction sendKey et d’envoyer le message si la
	touche saisie est "Entrée". Cette fonction permet aussi d’adapter la mise en page de la page en fonction de la
	taille du message, grâce à la fonction nouvelleTaille.
	Le paramètre "e" est la touche que le client presse dans le champ dédié à la recherche de nouveaux contacts.
	 */

	let message = document.getElementById("messageAEnvoyer").value;
	if(e.keyCode==13 && lastInputLetterCode != 13 && document.getElementById("messageAEnvoyer").dataCible != ""){
		let idCible = document.getElementById("messageAEnvoyer").dataCible;
		let contenuDeMessage = document.getElementById(idCible);
		let enfantContenuDeMessage = contenuDeMessage.children;
		if (enfantContenuDeMessage.length == 1){
				sendKey();
		}
		sendToServeur();
	}
	let taille = document.getElementById("messageAEnvoyer").scrollHeight;
	if(taille < 200){
		document.getElementById("envoyerMessage").style.height = taille + 30 + "px";
		nouvelleTaille();
	}
	if (lastInputLetterCode = 13){
		clean(e);
	}
	lastInputLetterCode = e.keyCode;
}

function quit(){
	/*
	Fonction appelée quand l'utilisateur quitte la page, pour que le serveur marque l'id comme non utilisée
	*/

	$.ajax( {
		type: "POST",
	  	url: "/quit",
	  	data: JSON.stringify({"userid":userid , "usercode":usercode}),
	  	contentType: "application/json",
	  	dataType: 'json',
	});
}



setInterval(getMessage, 500);
setInterval(updatePseudos, 5000);


function help () {
	document.getElementById("contenu").style.display = "none";
	document.getElementsByTagName("header")[0].style.display = "none";
	document.getElementById("pageAide").style.display = "initial";
	document.getElementsByTagName("body")[0].style.overflowY = "auto";
}

function public () {

	$.ajax( {
		type: "POST",
		url: "/setpublic",
		data: JSON.stringify({"userid":userid, "usercode":usercode}),
		contentType: "application/json",
		dataType: 'json',
	})
		.fail(function (xhr, status, error){
			if (xhr.status == 403){
				window.location.href = "/expire"
			}
			if (xhr.status == 400){
				alert("Erreur 400 : Je crois que le serveur fait nimp");
			}
		})
		.done(function (){
			document.getElementById("prive").style.opacity = "1";
			document.getElementById("public").style.opacity = ".6";
		})

}

function prive () {

	$.ajax( {
		type: "POST",
		url: "/setprive",
		data: JSON.stringify({"userid":userid, "usercode":usercode}),
		contentType: "application/json",
		dataType: 'json',
	})
		.fail(function (xhr, status, error){
			if (xhr.status == 403){
				window.location.href = "/expire"
			}
			if (xhr.status == 400){
				alert("Erreur 400 : votre requête était mauvaise, pourquoi diable voulez-vous la faire avec autre chose que POST ?");
			}
		})
		.done(function (){
			document.getElementById("public").style.opacity = "1";
			document.getElementById("prive").style.opacity = ".6";
		})
}

function afficherListeUtilisateurs () {
	document.getElementById("contenu").style.display = "none";
	document.getElementsByTagName("header")[0].style.display = "none";
	document.getElementById("pageListeUtilisateurs").style.display = "initial";
	chercheUser();
}

function afficherListeConversations () {
	document.getElementById("contenu").style.display = "flex";
	document.getElementsByTagName("header")[0].style.display = "flex";
	document.getElementsByTagName("body")[0].style.overflowY = "hidden";
	document.getElementById("pageListeUtilisateurs").style.display = "none";
	document.getElementById("pageAide").style.display = "none";
	nouvelleTaille();
}

function clicBoutonAjouterUtilisateur (e) {
	afficherListeConversations();
	let idDM = e.slice(0,8);
	document.getElementById("idNouveauContact").value = idDM;
	chercherNouveauContact(13);
}

function afficherPagePrecedente () {
	let NumeroPage = document.getElementById("page").innerHTML;
	let variableDureANommer = NumeroPage.indexOf("/");
	let pageActive = document.getElementById("page").innerHTML.slice(0,variableDureANommer);
	let pageRestantes = document.getElementById("page").innerHTML.slice(variableDureANommer,NumeroPage.lenght)

	if (pageActive != 1) {
		pageActive = parseInt(pageActive);
		pageActive -=1;
		document.getElementById("page").innerHTML = pageActive.toString()+pageRestantes;
		chercheUser();
	}
}

function afficherPageSuivante () {
	let NumeroPage = document.getElementById("page").innerHTML;
	let variableDureANommer = NumeroPage.indexOf("/");
	let pageActive = document.getElementById("page").innerHTML.slice(0,variableDureANommer);
	let pageRestantes = document.getElementById("page").innerHTML.slice(variableDureANommer,NumeroPage.lenght)

	if (pageActive != pageRestantes.slice(1, pageRestantes.lenght)) {
		pageActive = parseInt(pageActive);
		pageActive += 1;
		document.getElementById("page").innerHTML = pageActive.toString()+pageRestantes;
		chercheUser();
	}
}

function chercheUser () {
	let userToFind = document.getElementById("nomNouveauContact").value;
	let NumeroPage = document.getElementById("page").innerHTML;
	let variableDureANommer = NumeroPage.indexOf("/");
	let pageActive = document.getElementById("page").innerHTML.slice(0,variableDureANommer);
	$.ajax( {
    type: "POST",
    url: "/searchpseudo",
    data: JSON.stringify({"userid":userid, "usercode":usercode,"sought":userToFind, "nresults":pageActive*10+10}),
    contentType: "application/json",
    dataType: 'json',
	})
    .fail(function (){
        alert("La requête a echoué")
    })
    .done(function (result) { //de la forme {"nrenvoyes": int , "correspondants": une liste de couple (pseudo, id)}
		document.getElementById("listeUtilisateurs").innerHTML = "";


		let notreTableau = document.getElementById("listeUtilisateurs");
	
		let ligneTab = document.createElement("tr");
	
		let casePseudo = document.createElement("th");
		casePseudo.appendChild(document.createTextNode("Pseudo"));
	
		let caseID = document.createElement("th");
		caseID.appendChild(document.createTextNode("Identifiant"));

		let caseDM = document.createElement("th");
		caseDM.appendChild(document.createTextNode("Ecrire"));
	
		ligneTab.appendChild(casePseudo);
		ligneTab.appendChild(caseID);
		ligneTab.appendChild(caseDM);
	
		notreTableau.appendChild(ligneTab);

		document.getElementById("page").innerHTML = pageActive+"/"+(Math.floor(result["nrenvoyes"]/10+1));

    	for (let i = (pageActive-1)*10; i < result["nrenvoyes"]; i += 1) {
			afficherElementOfList(result["liste"][i]);
    	}

    	if (couleur == "#760000") {
    		orange();
    	}
    	else if (couleur == "#005DDD") {
    		bleu();
    	}
    	else if (couleur == "#288A00") {
    		vert();
    	}
    	else {
    		blanc();
    	}
    });
}

function updatePseudos(){

	let listeIds = [];
	let listeContacts = document.querySelectorAll(".caseContact");
	listeContacts.forEach(function(userId) {
		let ID = userId.getAttribute("id");
		listeIds.push(ID.slice(0,-4));
	});
	
	$.ajax({
		type: "POST",
	  	url: "/updpseudos",
		data:JSON.stringify({"userid": userid, "usercode":usercode, "listeIds":listeIds} ),
	  	contentType: "application/json",
	  	dataType: 'json',
	})
	.done(function (result){
		let i = 0;
		let pseudo = document.querySelectorAll(".caseContact > .nomContact");
		listeIds.forEach(function(userId) {
			if (pseudo[i] != result[userId]) {
				pseudo[i].innerHTML = result[userId];
			}
			i+=1;
		})
	})
	.fail(function (){alert("la requête d'update de pseudos a échoué")})
}

function afficherElementOfList(tupleUser) {
	let notreTableau = document.getElementById("listeUtilisateurs");
	
	let ligneTab = document.createElement("tr");
	
	let casePseudo = document.createElement("td");
	casePseudo.appendChild(document.createTextNode(tupleUser[0]));
	
	let caseID = document.createElement("td");
	caseID.appendChild(document.createTextNode(tupleUser[1]));

	let caseDM = document.createElement("td");
	let boutonDM = document.createElement("button");
	boutonDM.setAttribute("class", "boutonAjouterUtilisateur");
	boutonDM.setAttribute("id", tupleUser[1] + "listeUsers");
	boutonDM.setAttribute("onclick", "clicBoutonAjouterUtilisateur(this.id);");
	caseDM.appendChild(boutonDM);

	ligneTab.appendChild(casePseudo);
	ligneTab.appendChild(caseID);
	ligneTab.appendChild(caseDM);
	
	notreTableau.appendChild(ligneTab);

	document.getElementById(tupleUser[1] + "listeUsers").innerHTML = "+";
}

function changerPseudo () {
	document.getElementById("VotreID").innerHTML = "Votre ID était: "+userid;
	document.getElementById("VotreID").style.fontSize = "15px";
	let monPseudo = document.getElementById("nameUser").value;
	$.ajax( {
    type: "POST",
    url: "/changepseudo",
    data: JSON.stringify({"userid":userid, "usercode":usercode, "newpseudo":monPseudo}),
    contentType: "application/json",
    dataType: 'json',
	})
    .fail(function (){
        alert("La requête de changement de pseudo a echoué")
    })
    .done(function (){
    });
}

function orange() {
	couleur = "#760000";
	
	let fromUser = document.querySelectorAll(".fromUser");
	fromUser.forEach(function(e){
		e.style.backgroundColor = "#981E00";
		e.style.boxShadow = "0px 0px 30px 0px #691500";
	});

	let toUser = document.querySelectorAll(".toUser");
	toUser.forEach(function(e){
		e.style.backgroundColor = "#420000";
		e.style.boxShadow = "0px 0px 30px 0px #350000";
	});

	let boutonAjouterUtilisateur = document.querySelectorAll(".boutonAjouterUtilisateur");
	boutonAjouterUtilisateur.forEach(function(e){
		e.style.backgroundColor = "#D34D00";
	});

	let caseContact = document.querySelectorAll(".caseContact");
	caseContact.forEach(function(e){
		e.style.borderColor = "#D34D00";
	});

	let hdeux = document.querySelectorAll("h2");
	hdeux.forEach(function(e){
		e.style.color = "#D34D00";
	});

	let htrois = document.querySelectorAll("h3");
	htrois.forEach(function(e){
		e.style.color = "#D34D00";
	});

	document.getElementById("barreContact").style.backgroundColor = "#D34D00";
	document.getElementById("boutonEnvoie").style.backgroundColor = "#760000";
	document.getElementById("contenuMessage").style.border = "4px solid #D34D00";
	document.getElementById("contenuContact").style.border = "4px solid #D34D00";
	document.getElementById("contenuContact").style.backgroundColor = "#D34D00";
	document.getElementById("contenu").style.backgroundColor = "#D34D00";
	document.getElementById("envoyerMessage").style.backgroundColor = "#D34D00";
	document.getElementById("typeProfile").style.backgroundColor = "#D34D00";
	document.getElementById("boutonListeUtilisateurs").style.backgroundColor = "#AD0000";
	document.getElementById("public").style.backgroundColor = couleur;
	document.getElementById("prive").style.backgroundColor = couleur;
	document.getElementById("idNouveauContact").style.backgroundColor = "#7D2D00";
	document.getElementById("messageAEnvoyer").style.backgroundColor = "#7D2D00";
	document.getElementById("nomNouveauContact").style.backgroundColor = "#CB4900";
	let idcase = document.getElementById("messageAEnvoyer").dataCible;
	document.getElementById(idcase + "case").style.backgroundColor = couleur;
	document.getElementById("boutonRetour").style.backgroundColor = "#760000";

	document.getElementById("barreContact").style.color = "white";
}

function bleu () {
	couleur = "#005DDD";

	let fromUser = document.querySelectorAll(".fromUser");
	fromUser.forEach(function(e){
		e.style.backgroundColor = "#0071AD";
		e.style.boxShadow = "0px 0px 30px 0px #004569";
	});

	let toUser = document.querySelectorAll(".toUser");
	toUser.forEach(function(e){
		e.style.backgroundColor = "#004D76";
		e.style.boxShadow = "0px 0px 30px 0px #00273B";
	});

	let boutonAjouterUtilisateur = document.querySelectorAll(".boutonAjouterUtilisateur");
	boutonAjouterUtilisateur.forEach(function(e){
		e.style.backgroundColor = "#133056";
	});

	let caseContact = document.querySelectorAll(".caseContact");
	caseContact.forEach(function(e){
		e.style.borderColor = "#133056";
	});

	let hdeux = document.querySelectorAll("h2");
	hdeux.forEach(function(e){
		e.style.color = "#0097FF";
	});

	let htrois = document.querySelectorAll("h3");
	htrois.forEach(function(e){
		e.style.color = "#0097FF";
	});

	document.getElementById("barreContact").style.backgroundColor = "#133056";
	document.getElementById("boutonEnvoie").style.backgroundColor = "#004EB8";
	document.getElementById("contenuMessage").style.border = "4px solid #133056";
	document.getElementById("contenuContact").style.border = "4px solid #133056";
	document.getElementById("contenuContact").style.backgroundColor = "#133056";
	document.getElementById("contenu").style.backgroundColor = "#133056";
	document.getElementById("envoyerMessage").style.backgroundColor = "#133056";
	document.getElementById("typeProfile").style.backgroundColor = "#133056";
	document.getElementById("boutonListeUtilisateurs").style.backgroundColor = "#0059D3";
	document.getElementById("public").style.backgroundColor = couleur;
	document.getElementById("prive").style.backgroundColor = couleur;
	document.getElementById("idNouveauContact").style.backgroundColor = "#001E47";
	document.getElementById("messageAEnvoyer").style.backgroundColor = "#001E47";
	document.getElementById("nomNouveauContact").style.backgroundColor = "#00347C";
	let idcase = document.getElementById("messageAEnvoyer").dataCible;
	document.getElementById(idcase + "case").style.backgroundColor = couleur;
	document.getElementById("boutonRetour").style.backgroundColor = "#0059D3";

	document.getElementById("barreContact").style.color = "white";
}

function vert () {
	couleur = "#288A00";

	let fromUser = document.querySelectorAll(".fromUser");
	fromUser.forEach(function(e){
		e.style.backgroundColor = "#278800";
		e.style.boxShadow = "0px 0px 30px 0px #185400";
	});

	let toUser = document.querySelectorAll(".toUser");
	toUser.forEach(function(e){
		e.style.backgroundColor = "#0F3300";
		e.style.boxShadow = "0px 0px 30px 0px #0C2900";
	});

	let boutonAjouterUtilisateur = document.querySelectorAll(".boutonAjouterUtilisateur");
	boutonAjouterUtilisateur.forEach(function(e){
		e.style.backgroundColor = "#595959";
	});

	let caseContact = document.querySelectorAll(".caseContact");
	caseContact.forEach(function(e){
		e.style.borderColor = "#134D00";
	});

	let hdeux = document.querySelectorAll("h2");
	hdeux.forEach(function(e){
		e.style.color = "#30C200";
	});

	let htrois = document.querySelectorAll("h3");
	htrois.forEach(function(e){
		e.style.color = "#30C200";
	});

	document.getElementById("barreContact").style.backgroundColor = "#134D00";
	document.getElementById("boutonEnvoie").style.backgroundColor = "#249000";
	document.getElementById("contenuMessage").style.border = "4px solid #134D00";
	document.getElementById("contenuContact").style.border = "4px solid #134D00";
	document.getElementById("contenuContact").style.backgroundColor = "#134D00";
	document.getElementById("contenu").style.backgroundColor = "#134D00";
	document.getElementById("envoyerMessage").style.backgroundColor = "#134D00";
	document.getElementById("typeProfile").style.backgroundColor = "#134D00";
	document.getElementById("boutonListeUtilisateurs").style.backgroundColor = "#32AD00";
	document.getElementById("public").style.backgroundColor = couleur;
	document.getElementById("prive").style.backgroundColor = couleur;
	document.getElementById("idNouveauContact").style.backgroundColor = "#082100";
	document.getElementById("messageAEnvoyer").style.backgroundColor = "#082100";
	document.getElementById("nomNouveauContact").style.backgroundColor = "#717171";
	let idcase = document.getElementById("messageAEnvoyer").dataCible;
	document.getElementById(idcase + "case").style.backgroundColor = couleur;
	document.getElementById("boutonRetour").style.backgroundColor = "#32AD00";

	document.getElementById("barreContact").style.color = "white";
}

function blanc () {
	let i = 0;
	let couleurPossible = ["#BC2200","#A200BC","#30BC00","#4700BC","#9ABC00","#BC0058","#00BC58","#BC6700","#00B6BC","#0033BC",];
	couleur = "#5C5C5C";

	let fromUser = document.querySelectorAll(".fromUser");
	fromUser.forEach(function(e){
		e.style.backgroundColor = couleurPossible[i];
		e.style.boxShadow = "0px 0px 20px 0px " + couleurPossible[i];
		if (i==9) {
			i=0;
		}
		i+=1;
	});

	let toUser = document.querySelectorAll(".toUser");
	toUser.forEach(function(e){
		e.style.backgroundColor = couleurPossible[i];
		e.style.boxShadow = "0px 0px 30px 0px " + couleurPossible[i];
		if (i==9) {
			i=0;
		}
		i+=1;
	});

	let boutonAjouterUtilisateur = document.querySelectorAll(".boutonAjouterUtilisateur");
	boutonAjouterUtilisateur.forEach(function(e){
		e.style.backgroundColor = "#5F5F5F";
	});

	let caseContact = document.querySelectorAll(".caseContact");
	caseContact.forEach(function(e){
		e.style.borderColor = "#CCCCCC";
	});

	let hdeux = document.querySelectorAll("h2");
	hdeux.forEach(function(e){
		e.style.color = "white";
	});

	let htrois = document.querySelectorAll("h3");
	htrois.forEach(function(e){
		e.style.color = "white";
	});

	document.getElementById("barreContact").style.backgroundColor = "#CCCCCC";
	document.getElementById("boutonEnvoie").style.backgroundColor = "#292929";
	document.getElementById("contenuMessage").style.border = "4px solid #CCCCCC";
	document.getElementById("contenuContact").style.border = "4px solid #CCCCCC";
	document.getElementById("contenuContact").style.backgroundColor = "#CCCCCC";
	document.getElementById("contenu").style.backgroundColor = "#CCCCCC";
	document.getElementById("envoyerMessage").style.backgroundColor = "#CCCCCC";
	document.getElementById("typeProfile").style.backgroundColor = "#CCCCCC";
	document.getElementById("boutonListeUtilisateurs").style.backgroundColor = "#292929";
	document.getElementById("public").style.backgroundColor = couleur;
	document.getElementById("prive").style.backgroundColor = couleur;
	document.getElementById("idNouveauContact").style.backgroundColor = "#444444";
	document.getElementById("messageAEnvoyer").style.backgroundColor = "#444444";
	document.getElementById("nomNouveauContact").style.backgroundColor = "#3B3B3B";
	let idcase = document.getElementById("messageAEnvoyer").dataCible;
	document.getElementById(idcase + "case").style.backgroundColor = couleur;
	document.getElementById("boutonRetour").style.backgroundColor = "#292929";

	document.getElementById("barreContact").style.color = "#4E4E4E";
}
