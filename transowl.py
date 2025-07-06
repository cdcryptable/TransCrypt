from flask import (
    Flask, request, url_for, render_template, jsonify, redirect
    )
#import os
from random import randint
from secrets import token_hex
from lib.groupe import Groupe

### Init de l'app
app = Flask(__name__)

### Variables globales

groupe = Groupe(1<<14)
newmessages = {} #pas pour newmessages cependant, trop lent etc...

### fonctions serveur uniquement

def addtobuffer(content, src, to, key): #changer l'ordre bizarre des variables
    """

    :param content: le message ou la clef
    :param src: l'id de l'utilisateur qui envoie
    :param to: l'id de l'utilisateur qui reçoit
    :param key: v ou faux dépendant de si c'est l'envoi de la clef ou d'un message
    :return: rien.

    """
    if key == "true":
        newmessages[to].append({"id": src, "msg": content, "key": "true"})
    else:
        newmessages[to].append({"id": src, "msg": content, "key": "false"})

def readbuffer(id_check):
    """
    Lit les nouveaux messages et supprime ceux déjà lus.
    :param id_check: l'id de la personne pour lquelle on lit le buffer:
    :return: la liste des messages envoyées à l'utilsateur id_check

    """
    a = newmessages[id_check]
    newmessages[id_check] = []
    return a

### Chemins d'accès

@app.route("/")
@app.route("/home")
def home():
    """
    Appelée quand le client va sur l'adresse / ou /home
    :return: renvoie la page html principale à l'utilisateur
    """
    return render_template("conv.html")

@app.route("/expire", methods=["GET", "POST"])
def expired():
    """
    Appelée quand verif renvoie False
    :return: une page d'expiration, qui permet de se réconnecter à la page principale
    """
    return render_template("expire.html")


### Traitement des requêtes ajax

@app.route("/getid", methods=["GET", "POST"])
def getid(): #ajouter un paramètre pseudo
    """
    Appelée quand le client charge la page
    :return: renvoie l'id spécifique du client ainsi que le code associé
    """

    if request.method == "POST" :
        r = 10_000_000
        # r =  randint(0, 100_000_000)
        while groupe.members.get(str(r).zfill(8)) is not None :
            r = randint(0, 100_000_000)
        code = token_hex(8)

        groupe.addmember(str(r).zfill(8), code, "User_" + str(r).zfill(8),)
        newmessages[str(r).zfill(8)] = []
        return jsonify({"userid":str(r).zfill(8), "usercode":code})


@app.route("/send", methods=["GET", "POST"])
def send():
    """
    Appelée quand l'utilisateur envoie un message
    :return: la valeur renvoyée n'a pas une grande utilité,
    """
    if request.method == "POST" :
        msgData = request.get_json()

        if groupe.verif(msgData["userid"], msgData["usercode"]):
            try :
                addtobuffer(msgData["msg"], msgData["userid"].zfill(8), msgData["to"].zfill(8), msgData["key"])
                return {}, 200

            except KeyError : return "ID d'utilisateur invalide", 400

        else : return "Session expiree", 403


@app.route("/check", methods=["GET", "POST"])  
def check():
    """
    Appelé périodiquement par le client (toutes les secondes) pour vérifier si de nouveaux messages ont été envoyés
    :return: une liste des messages reçus depuis le dernière appel
    """
    if request.method == "POST":
        rqData = request.get_json()
        if groupe.verif(rqData["userid"], rqData["usercode"]):
            buffed = readbuffer(rqData["userid"])
            return jsonify(buffed)

        else : return "Session expiree", 403

@app.route("/tobeornottobe", methods = ["GET", "POST"])
def ishe():
    """
    Appelée quand un client rajoute un contact
    :return: 1 si l'utilisateur demandé existe 0 sinon
    """

    if request.method == "POST":
        user = request.get_json()["id"].zfill(8)
        resp = {"exists":1}
        if groupe.members.get(user) is None :
            resp["exists"] = 0
        return resp

@app.route("/pospseudo", methods=["GET", "POST"])
def pospseudo():
    if request.method == "POST" :
        rqData = request.get_json()
        n = groupe.findi(rqData["pseudo"])
        return {"pos" : n}
    else: return "bad request", 400

@app.route("/changepseudo", methods=["GET", "POST"])
def cpseudo():
    if request.method == "POST":
        rqData = request.get_json()
        if groupe.verif(rqData["userid"], rqData["usercode"]):
            groupe.cpseudo(rqData["userid"], rqData["newpseudo"])
            return {}, 200
        return "Session expiree", 403
    return "bad request", 400

@app.route("/changepublic", methods=["GET", "POST"])
def cpublic():
    if request.method == "POST" :
        rqData = request.get_json()
        if groupe.verif(rqData["userid"], rqData["usercode"]):
            groupe.cpublic(rqData["userid"])
            return {}, 200
        return "Session expiree", 403
    return "bad request", 400

@app.route("/setpublic", methods=["GET", "POST"])
def setpublic():
    if request.method == "POST":
        rqData = request.get_json()
        if groupe.verif(rqData["userid"] ,rqData["usercode"]):
            groupe.setpublic(rqData["userid"])
            return {}, 200
        return "Session expiree", 403
    return "bad request", 400

@app.route("/setprive", methods=["GET", "POST"])
def setprive():
    if request.method == "POST":
        rqData = request.get_json()
        if groupe.verif(rqData["userid"] ,rqData["usercode"]):
            groupe.setprive(rqData["userid"])
            return {}, 200
        return "Session expiree", 403
    return "baq request", 400

@app.route("/searchpseudo", methods=["GET", "POST"])
def speudo():
    if request.method == "POST" :
        rqData = request.get_json()
        if groupe.verif(rqData["userid"], rqData["usercode"]):

            least, most, found = groupe.match(rqData["sought"])
            if not found :
                return {"nrenvoyes":0, "liste":[]}, 200

            matched = []
            #modifier boucle suivante pour intéegrer rqData["nresluts"]
            for couple in groupe.pseudoR[least: most] :
                if groupe[couple[1]][2] : #public bool
                    matched.append(couple)

            #print(groupe.pseudoR)
            if most < len(groupe) :
                last = groupe[most]
                if groupe[last[1]][2] and last[1][:len(rqData["sought"])] == rqData["sought"]:
                    matched.append(last)

            #print(matched)
            return {"nrenvoyes":len(matched), "liste":matched}


        return "Session expiree", 403

    return "bad request", 400

@app.route("/test", methods=["GET", "POST"])
def test():
    if request.method == "POST":
        return {}

@app.route("/updpseudos", methods = ["GET", "POST"])
def updpseudos(): 
    if request.method == "POST" :
        rqData = request.get_json()
        if groupe.verif(rqData["userid"], rqData["usercode"]):
            updated = {ident:groupe[ident][1] if groupe[ident][2] else ident for ident in rqData["listeIds"]} #comprehension conditionnelle, le plaisir interdit
            print(updated) 
            return {}, 200
        return "Session expiree", 403
    return "pas un requete POST", 400

@app.route("/quit", methods=["GET", "POST"])
def pagequit():
    """
    Appelée quand le client quitte sa session
    Libère son id
    :return: dictionnaire vide
    """
    if request.method == "POST":
        rqData = request.get_json()
        if groupe.verif(rqData["userid"], rqData["usercode"]):
            groupe.delmember(rqData["userid"])
            newmessages.pop(rqData["userid"])
            #print(f"groupe : {groupe}")
        return {}

if __name__=="__main__":
        app.run(host="192.168.0.11", debug=True)
