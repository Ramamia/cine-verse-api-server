# Web Request-Response Cycle (WRRC) Report

## 1. What is the Web Request-Response Cycle (WRRC)?

To put it in super simple terms, the web is basically a huge conversation. When we browse the internet, our web browser (the **Client**) and the backend computer hosting the website (the **Server**) are constantly talking to each other. 

The **Web Request-Response Cycle (WRRC)** is the official name for this conversation loop. It is called a "cycle" because it is a continuous, repetitive loop where every action has an equal and opposite reaction:
1. **The Request:** The client asks for something (like a webpage, an image, or sending a registration form).
2. **The Response:** The server processes that request and sends back the answer (like the HTML files, an image, or a "Success" message).

Without this cycle, the web wouldn't work. The browser would just be a blank screen because it wouldn't know how to ask for files, and the server would just sit there idle.

---

## 2. The Core Components of the Cycle

There are four main players in this cycle:

1. **The Client (The Web Browser):** This is the frontend interface that the user interacts with (built with React in my Cine-Verse project). It is responsible for starting the conversation by packaging a request and sending it over the network.
2. **The Network / Protocol (HTTP):** This is the "language" they use to talk. Hypertext Transfer Protocol (HTTP) defines the rules, like using **GET** to fetch data or **POST** to submit data, and carrying extra info in "headers" (like content-type) and a "body" (the actual data).
3. **The Web Server (Express.js):** The "brain" of the backend. It sits there listening for requests on a specific port (like `3000` or port `80` in production). When a request hits, it routes it to the right function, processes it, and decides if it needs to talk to the database.
4. **The Database (PostgreSQL):** The permanent memory. It doesn't talk directly to the browser. It only talks to the web server when the server asks to save or look up something.

---

## 3. How the Cycle Flows (With and Without Database)

The flow of the cycle depends completely on what the client is asking for:

* **Static/Direct Requests (No Database):** If the client just wants a static asset (like loading a simple style file or an image), the web server can grab it directly from its files and send it right back. The database is never touched.
* **Dynamic Requests (With Database):** If the client is signing up, logging in, or writing a review, the server has to query the database to verify credentials or save the new record before it can respond.

### Diagram of the Web Request-Response Cycle:

Here is how the message travels step-by-step during a dynamic database request (like registering a user):

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Clicks Submit)
    participant Browser as Client (Web Browser)
    participant Server as Web Server (Express API)
    participant DB as Database (Postgres)

    User->>Browser: Types details & clicks "Take Your Seat"
    Note over Browser: 1. Compiles JSON payload<br/>2. Starts fetch() request
    Browser->>Server: HTTP POST /api/auth/register (Request Header + Body)
    
    Note over Server: 3. Receives request<br/>4. Checks if email already exists
    Server->>DB: SQL Query: SELECT * FROM users WHERE email = $1
    DB-->>Server: Returns user rows (if any)
    
    Note over Server: 5. Hashes password with bcrypt<br/>6. Inserts user into DB
    Server->>DB: SQL Query: INSERT INTO users ... RETURNING id, email, nickname
    DB-->>Server: Returns new user row data (UUID, Email, Nickname)
    
    Note over Server: 7. Generates JWT Token<br/>8. Formulates HTTP Response
    Server-->>Browser: HTTP 201 Created (JSON Response with token & user data)
    
    Note over Browser: 9. Saves token to LocalStorage<br/>10. Updates UI (Redirects to Rotunda)
    Browser->>User: Renders welcome page & rooms
```

---

## 4. Real-World Code Walkthrough: User Registration in Cine-Verse

Let's look at exactly how this cycle runs in my actual code for **User Registration**.

### Step 1: The Request Originates on the Frontend (React Client)

When a user enters their email, password, and nickname, and clicks **Take Your Seat**, the browser executes the `register` function inside my [src/services/api.js](file:///c:/Users/User/Desktop/Y4S2/Web%20App/My%20work/cine-verse-WebApp/src/services/api.js#L13-L24):

```javascript
register: async (email, password, nickname) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nickname }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}
```

* **What happens here:** The `fetch` API initiates the HTTP request. It tells the browser to make a `POST` request to the backend `/api/auth/register` endpoint, sets the content header to JSON, and stringifies the user's data into the request body.

---

### Step 2: The Request Body in the Browser DevTools (Payload)

If you open the browser's Developer Tools (Press **F12**), go to the **Network** tab, click on the `/register` request, and look at the **Payload** tab, you will see the raw request body that the browser sent out:

```json
{
  "email": "student@htu.edu.jo",
  "password": "securePassword123",
  "nickname": "CineFanatic"
}
```

This JSON object is carried across the network as the body payload of our HTTP POST request.

---

### Step 3: The Web Server Receives and Processes the Request

The request arrives at the backend Express.js server and is routed to the registration handler in [routes/auth.js](file:///c:/Users/User/Desktop/Y4S2/Web%20App/My%20work/cine-verse-WebServer/cine-verse-api-server/routes/auth.js#L9-L46):

```javascript
router.post("/register", async (req, res) => {
    try {
        const { email, password, nickname } = req.body;

        // 1. Check if this user is already in the system
        const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "User already exists with that email" });
        }

        // 2. Hash the password so it's safe
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Insert the new user into the database
        const newUser = await pool.query(
            "INSERT INTO users (email, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname",
            [email, passwordHash, nickname]
        );

        // 4. Make a JWT token
        const token = jwt.sign(
            { id: newUser.rows[0].id, email: newUser.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } 
        );

        // 5. Send back the response
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
```

* **What happens here:** 
  1. The server extracts `email`, `password`, and `nickname` from `req.body`.
  2. It performs the first database call (`SELECT`) to make sure the email is unique.
  3. If unique, it uses `bcrypt.hash` to hash the password.
  4. It performs the second database call (`INSERT`) to save the new user record.
  5. It signs a JWT token using `jwt.sign` with a secret key so the user stays logged in.
  6. Finally, it calls `res.status(201).json(...)` to package the success response.

---

### Step 4: The Database Execution (PostgreSQL)

During the server execution, PostgreSQL receives and executes the SQL commands sent from our Express application pool:

```sql
INSERT INTO users (email, password_hash, nickname) 
VALUES ('student@htu.edu.jo', '$2b$10$hashedstuffhere...', 'CineFanatic') 
RETURNING id, email, nickname;
```

* **What happens here:** Postgres inserts the new record, automatically runs the `uuid_generate_v4()` function to assign a unique UUID to the user, saves it permanently in the hard drive, and returns the generated `id`, `email`, and `nickname` back to the Express Node.js process.

---

### Step 5: The Response in Browser DevTools

Once the Express server gets the database results and formats them, it sends the HTTP response back to the client browser. 

In your browser's Developer Tools under the **Network** tab, if you click the `/register` request and select the **Response** or **Preview** tab, you will see the payload returned:

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YjdhMWY4LWRlZWMtNGE3My1iMjg4LWNkYjI0OGQ0YTY1ZSIsImVtYWlsIjoic3R1ZGVudEBodHUuZWR1LmpvIiwiaWF0IjoxNzgxNjA5MjE1LCJleHAiOjE3ODE2MDkyMTV9.exampletoken_signature...",
  "user": {
    "id": "66b7a1f8-deec-4a73-b288-cdb248d4a65e",
    "email": "student@htu.edu.jo",
    "nickname": "CineFanatic"
  }
}
```

### Step 6: Frontend Receives Response and Updates
Back in React, the `register` function returns this object. The UI saves the `token` to `localStorage` (so the browser remembers them next time they visit), updates the state to log them in, and lets them access the movie rooms!
