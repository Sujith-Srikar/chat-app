
# Chat Application

A simple chat app built using websockets

## WebSocket Schema

### What the user can send

<details>
<summary><strong>Join a Room</strong></summary>

```json
{
  "type": "join",
  "payload": {
    "roomId": "123"
  }
}
```

**Fields:**

* `type` (string): `"join"` — indicates the user wants to join a room
* `payload.roomId` (string): ID of the room to join (e.g. `"123"`)

</details>

---

<details>
<summary><strong>Send a Message</strong></summary>

```json
{
  "type": "chat",
  "payload": {
    "message": "hi!"
  }
}
```

**Fields:**

* `type` (string): `"chat"` — indicates the user is sending a chat message
* `payload.message` (string): The message text to send (e.g. `"hi!"`)

</details>

---

### What the server can send (what users receive)

<details>
<summary><strong>Broadcasted Chat Message</strong></summary>

```json
{
  "type": "chat",
  "payload": {
    "message": "hi!"
  }
}
```

**Fields:**

* `type` (string): `"chat"` — indicates this is a broadcasted message to all users in the room
* `payload.message` (string): The actual message sent by a user

</details>