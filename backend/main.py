import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# quando for para produção da uma atenção aqui rpzd
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-troque-em-producao")

# o banco de dados fica num arquivo .db local (SQLite)
# é tipo um Excel gigante mas que o Python consegue acessar via código
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///amadas.db"

# isso aqui só evita um aviso chato no terminal, pode deixar False mesmo
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# em produção troca o localhost pelo domínio real do site
CORS(app, origins=os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173"))

db = SQLAlchemy(app)



class Usuario(db.Model):
    id    = db.Column(db.Integer, primary_key=True)   
    nome  = db.Column(db.String(100), nullable=False)  
    email = db.Column(db.String(120), unique=True, nullable=False)  
    senha = db.Column(db.String(200), nullable=False)  

    def to_dict(self):
        return {"id": self.id, "nome": self.nome, "email": self.email}


@app.route("/")
def index():
    return jsonify({"status": "API ONG Amadas funcionando!"})


# rota de cadastro — recebe POST com nome, email e senha em JSON
@app.route("/cadastro", methods=["POST"])
def cadastro():
    dados = request.get_json()

    # .strip() remove espaços antes e depois (ex: "  admin@gmail.com  " vira "admin@gmail.com")
    # o "or ''" é pra não quebrar se o campo vier None
    nome  = (dados.get("nome")  or "").strip()
    email = (dados.get("email") or "").strip().lower()  # .lower() pra não ter "Admin@gmail.com" e "admin@gmail.com" como dois emails diferentes
    senha = (dados.get("senha") or "").strip()

    # validações básicas antes de tentar salvar qualquer coisa
    if not nome or not email or not senha:
        return jsonify({"ok": False, "msg": "Preencha todos os campos."}), 400

    if len(senha) < 6:
        return jsonify({"ok": False, "msg": "A senha deve ter ao menos 6 caracteres."}), 400

    # verifica se já existe um usuário com esse email no banco
    if Usuario.query.filter_by(email=email).first():
        return jsonify({"ok": False, "msg": "E-mail já cadastrado."}), 409  

    # gera o hash da senha — NUNCA salvo a senha original, só o hash
    # é tipo um código embaralhado que não tem como desfazer 
    novo = Usuario(
        nome=nome,
        email=email,
        senha=generate_password_hash(senha),
    )
    db.session.add(novo)
    db.session.commit()  

    return jsonify({"ok": True, "msg": "Cadastro realizado!", "usuario": novo.to_dict()}), 201 


# rota de login — verifica email e senha
@app.route("/login", methods=["POST"])
def login():
    dados = request.get_json()

    email = (dados.get("email") or "").strip().lower()
    senha = (dados.get("senha") or "").strip()

    if not email or not senha:
        return jsonify({"ok": False, "msg": "Preencha e-mail e senha."}), 400

    # busca o usuário pelo email
    usuario = Usuario.query.filter_by(email=email).first()

    # check_password_hash compara a senha digitada com o hash guardado no banco
    # se o usuário não existir OU a senha não bater, cai aqui
    # devolvo a mesma mensagem pra não vazar se o email existe ou não (segurança básica)
    if not usuario or not check_password_hash(usuario.senha, senha):
        return jsonify({"ok": False, "msg": "E-mail ou senha incorretos."}), 401  # 401 = Unauthorized

    return jsonify({"ok": True, "msg": "Login realizado!", "usuario": usuario.to_dict()})


if __name__ == "__main__":
    # cria as tabelas no banco se ainda não existirem (tipo uma migração automática)
    with app.app_context():
        db.create_all()
        print("Banco de dados pronto.")

    # debug=True recarrega o servidor sozinho quando salvo o arquivo — muito útil pra dev
    # MEXER AQUI TAMBEM QUANDO FOR PARA PRODUÇÃO
    app.run(debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true", port=5000)
