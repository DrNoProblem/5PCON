import { getToken } from "../../helpers/token-verifier";

async function addRoom(name: string, co_owner: string, users: string[]) {
    const response = await fetch("http://localhost:4100/room/add", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ name, co_owner, users })
    });
    const data = { response: await response.json(), status: response.status };
    return data;
}

export default addRoom;