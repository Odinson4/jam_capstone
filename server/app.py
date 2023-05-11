from flask import Flask
from flask_migrate import Migrate
from flask_restful import Api, Resource
from flask_cors import CORS
from flask import make_response, request, jsonify, session
from models import db, Users, Folders, Blocks, Templates, MetaData
import psycopg2
import json

import os

# from flask_bcrypt import Bcrypt
from models import db
# Imports for using .env
import os
from dotenv import load_dotenv
app = Flask(__name__)
# Load the env file
load_dotenv()
# Use os.environ.get() to get the data

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user3:S6YU1DXPVxxIhjQcGJ9YwpEMgvGKT6g8@dpg-ch5818ks3fvqdimfasc0-a.oregon-postgres.render.com/jam'
# postgres://user3:S6YU1DXPVxxIhjQcGJ9YwpEMgvGKT6g8@dpg-ch5818ks3fvqdimfasc0-a.oregon-postgres.render.com/jam
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)
CORS(app, origins="*")

app.secret_key = "secret key"


@app.route('/users/<int:user_id>', methods=['PATCH'])
def update_user(user_id):
    data = request.get_json()
    user = Users.query.get(user_id)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    if 'username' in data:
        user.username = data['username']
        db.session.commit()

    return jsonify(user.to_dict()), 200


class AllUsers(Resource):
    def get(self):
        users = Users.query.all()
        users_list = [users.to_dict() for users in users]
        response = make_response(jsonify(users_list), 200)

        return response

    def post(self):
        data = request.get_json()
        new_user = Users(
            username=data['username'],
            email=data['email'],
        )
        new_user.password_hash = data['password']
        db.session.add(new_user)
        db.session.commit()
        response = make_response(jsonify(new_user.to_dict()), 201)

        return response


api.add_resource(AllUsers, '/users')


class UsersById(Resource):
    def get(self, id):
        user = Users.query.get(id)
        response = make_response(jsonify(user.to_dict()), 200)

        return response

    def patch(self, id):
        data = request.get_json()
        if not data:
            return make_response(jsonify({'error': 'No data received'}), 400)

        user = Users.query.get(id)
        if not user:
            return make_response(jsonify({'error': 'User not found'}), 404)

        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if 'password' in data:
            user.password = data['password']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if '_password_hash' in data:
            user._password_hash = data['_password_hash']

        db.session.commit()
        response = make_response(jsonify(user.to_dict()), 200)

        return response

    def delete(self, id):
        user = Users.query.get(id)
        db.session.delete(user)
        db.session.commit()
        response = make_response(jsonify(user.to_dict()), 200)

        return response


api.add_resource(UsersById, '/users/<int:id>')


class AllFolders(Resource):
    def get(self):
        folders = Folders.query.all()
        folders_list = [folders.to_dict() for folders in folders]
        response = make_response(jsonify(folders_list), 200)

        return response

    def post(self):
        data = request.get_json()
        new_folder = Folders(
            name=data['name'],
            user_id=data['user_id'],
            Blocks=data['Blocks']
        )
        db.session.add(new_folder)
        db.session.commit()
        response = make_response(jsonify(new_folder.to_dict()), 201)

        return response


api.add_resource(AllFolders, '/folders')


class FoldersById(Resource):
    def get(self, id):
        folder = Folders.query.get(id)
        response = make_response(jsonify(folder.to_dict()), 200)

        return response

    def patch(self, id):
        data = request.get_json()
        folder = Folders.query.get(id)
        folder.name = data['name']
        folder.user_id = data['user_id']
        db.session.commit()
        response = make_response(jsonify(folder.to_dict()), 200)

        return response

    def delete(self, id):
        folder = Folders.query.get(id)
        db.session.delete(folder)
        db.session.commit()
        response = make_response(jsonify(folder.to_dict()), 200)

        return response


api.add_resource(FoldersById, '/folders/<int:id>')


class AllBlocks(Resource):
    def get(self):
        blocks = Blocks.query.all()
        blocks_list = []
        user_id = request.args.get('user_id')
        if user_id:
            blocks = Blocks.query.filter_by(user_id=user_id).all()
        else:
            blocks = Blocks.query.all()

        for block in blocks:
            test = ""
            for i in block.blocks:
                test += i
            block_data = json.loads(test)

            block_info = {
                'id': block.id,
                'blocks': block_data,
                'time': block.time,
                'version': block.version,
                'user_id': block.user_id,
                'folder_id': block.folder_id
            }
            blocks_list.append(block_info)

        response = make_response(jsonify(blocks_list), 200)
        return response

    def post(self):
        data = request.get_json()
        blocks_data = data.get('blocks')
        time_data = data.get('time')
        version_data = data.get('version')
        user_id = data.get('user_id')
        folder_id = data.get('folder_id')

        blocks = []
        for block_item in blocks_data:
            block = Blocks(
                blocks=json.dumps(block_item),
                time=time_data,
                version=version_data,
                user_id=user_id,
                folder_id=folder_id
            )
            db.session.add(block)
            blocks.append(block)

        db.session.commit()

        blocks_list = []
        for block in blocks:
            print("blocks.blocks:", block.blocks)
            test = ""
            for i in block.blocks:
                test += i
            block_data = json.loads(test)

            block_info = {
                'id': block.id,
                'blocks': block_data,
                'time': block.time,
                'version': block.version,
                'user_id': block.user_id,
                'folder_id': block.folder_id
            }
            blocks_list.append(block_info)

        response = make_response(jsonify(blocks_list), 200)
        return response


api.add_resource(AllBlocks, '/blocks')


class BlocksById(Resource):
    def get(self, block_id):
        block = Blocks.query.get(block_id)
        print(block)
        print(block_id)
        block = Blocks.query.all()
        response = make_response({}, 200)

        return response

    def patch(self, block_id):
        data = request.get_json()
        blocks_data = data.get('blocks')
        time_data = data.get('time')
        version_data = data.get('version')
        user_id = data.get('user_id')
        folder_id = data.get('folder_id')

        block = Blocks.query.get(block_id)
        if not block:
            return {"message": "Block not found"}, 404
        # print("blocks.blocks:", block.blocks)
        print("block", block)

        block.blocks = json.dumps(blocks_data)
        print("blocks_data", blocks_data)
        block.time = time_data
        block.version = version_data
        block.user_id = user_id
        db.session.commit()

        blocks_list = []
        print("blocks.blocks:", block.blocks)
        test = ""
        for i in block.blocks:
            test += i
        block_data = json.loads(test)
        print("block_data", block_data)

        block_info = {
            'id': block.id,
            'blocks': block_data,
            'time': block.time,
            'version': block.version,
            'user_id': block.user_id,
            'folder_id': block.folder_id
        }

        blocks_list.append(block_info)
        print("blocks_list", blocks_list)

        response = make_response(jsonify(blocks_list), 200)
        return response

    def delete(self, block_id):
        try:
            block = Blocks.query.get(block_id)
            if block:
                db.session.delete(block)
                db.session.commit()
                return ({"message": "Block deleted successfully"}), 200
            else:
                return ({"message": "Block not found"}), 404
        except Exception as e:
            print(e)
            return ({"message": "Something went wrong"}), 500


api.add_resource(BlocksById, '/blocks/<int:block_id>')


class Login(Resource):
    def post(self):
        try:
            jsoned_request = request.get_json()
            user = Users.query.filter(
                Users.username == jsoned_request["username"]).first()
            if user.authenticate(jsoned_request["password"]):
                session['user_id'] = user.id
                res = make_response(jsonify(user.to_dict()), 200)
                return res

        except Exception as e:
            res = make_response(jsonify({"error": [e.__str__()]}), 500)
            return res


api.add_resource(Login, '/login')


class get_logged_user(Resource):
    def get(self):
        user_id = session.get('user_id')
        print(user_id)
        if user_id:
            user = Users.query.filter(Users.id == session["user_id"]).first()
            res = make_response(jsonify(user.to_dict()), 200)
            return res


api.add_resource(get_logged_user, '/logged_user')


class check_logged_in(Resource):
    def get(self):
        user_id = session.get('users_id')
        if user_id:
            if user_id != None:
                return make_response({"logged_in": True}, 200)
        return make_response({"logged_in": False}, 200)


api.add_resource(check_logged_in, '/is_logged_in')


class logout(Resource):
    def delete(self):
        session['user_id'] = None
        res = make_response(jsonify({"login": "Logged out"}), 200)
        return res


api.add_resource(logout, '/logout')

if __name__ == '__main__':
    app.run()
