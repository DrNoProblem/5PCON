import UserModel from '../user-model';

export const voidUser: UserModel = {
    '_id': "",
    'name': "no-display",
    'email': "",
    'password': "",
    'role': "",
    'draws': [],
    'notes': [],
    'deck': [],
}

export default voidUser;