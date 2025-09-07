//our global variables 
let auth = false;
let posts = [];
let currentPage = 1;
let pageSize = 7;
let sortKey = "id";
let sortDir = "asc";
let editingPost = null;

//login  
function renderLogin(){
  document.getElementById("app").innerHTML = `
    <div style="max-width:500px; margin:50px auto;">
      <h2> Login </h2>
      <label>Email:</label>
      <input id="email" type="email" placeholder="...@example.com"><br>
      <label>Password:</label>
      <input id="password" type="password" placeholder="******"><br>
      <button onclick="login()"> Login </button>
      <div id="loginMsg" style="color:red;"> </div>
    </div>
  `;
}

function login(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if(!email.includes("@")) return document.getElementById("loginMsg").innerText="Invalid email";
  if(password.length<6) return document.getElementById("loginMsg").innerText="Password must be atleast 6 digits";
  auth = true;
  renderDashboard();
}

function logout(){ 
  auth=false; 
  renderLogin(); 
}

//html dashboard 
function renderDashboard(){
  document.getElementById("app").innerHTML = `
    <header>
      <div>Posts Dashboard</div>
      <button onclick="logout()">Logout</button>
    </header>
    <div class="container">
      <aside>
        <button onclick="showPosts()">Posts</button>
        <button onclick="showForm()">Create Post</button>
      </aside>
      <main id="main"></main>
    </div>
  `;
  showPosts();
}

//post table with html
async function showPosts(){
  const main = document.getElementById("main");
  main.innerHTML = `
    <h2>Posts</h2>
    <input id="search" placeholder="Search..." oninput="renderTable()">
    <select id="pageSize" onchange="changePageSize(this.value)">
      <option 5> 5 </option> <option 10> 10 </option> <option 20> 20 </option>
    </select>
    <div id="tableWrap">Loading...</div>
  `;

  if(posts.length===0){
    const resp = await fetch("https://jsonplaceholder.typicode.com/posts");
    posts = await resp.json();
  }
  renderTable();
}

function renderTable(){
  const q = document.getElementById("search").value.toLowerCase();
  let filtered = posts.filter(p=>p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q));

  filtered.sort((a,b)=>{
    let v1=a[sortKey], v2=b[sortKey];
    if(typeof v1==="string"){ v1=v1.toLowerCase(); v2=v2.toLowerCase(); }
    if(v1<v2) return sortDir==="asc"?-1:1;
    if(v1>v2) return sortDir==="asc"?1:-1;
    return 0;
  });

  const start=(currentPage-1)*pageSize;
  const pagePosts=filtered.slice(start,start+pageSize);

  let rows=pagePosts.map(p=>`
    <tr>
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>${p.body}</td>
      <td><button onclick="editPost(${p.id})">Edit</button></td>
    </tr>`).join("");

  document.getElementById("tableWrap").innerHTML=`
    <table>
      <thead>
        <tr>
          <th onclick="sortBy('id')">ID</th>
          <th onclick="sortBy('title')">Title</th>
          <th>Body</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div>
      <button onclick="prevPage()">Prev</button>
      Page ${currentPage} of ${Math.ceil(filtered.length/pageSize)}
      <button onclick="nextPage()">Next</button>
    </div>
  `;
}

function sortBy(key){
  if(sortKey===key) sortDir=(sortDir==="asc"?"desc":"asc");
  else{ sortKey=key; sortDir="asc"; }
  renderTable();
}

function changePageSize(val){ 
  pageSize=Number(val); 
  currentPage=1; 
  renderTable(); 
}

function prevPage(){ 
  if(currentPage>1){ currentPage--; renderTable(); } 
}

function nextPage(){ 
  currentPage++; 
  renderTable(); 
}

//Create & Edit  
function showForm(post={}){
  editingPost=post.id?post:null;
  document.getElementById("main").innerHTML=`
    <h2>${editingPost?"Edit":"Create"} Post</h2>
    <form onsubmit="savePost(event)">
      <input type="hidden" id="postId" value="${post.id||""}">
      <label>Title:</label>
      <input id="title" value="${post.title||""}" required><br>
      <label>Body:</label>
      <textarea id="body" required>${post.body||""}</textarea><br>
      <button type="submit">Save</button>
      <button type="button" onclick="showPosts()">Cancel</button>
    </form>
  `;
}

function savePost(e){
  e.preventDefault();
  const id=document.getElementById("postId").value;
  const title=document.getElementById("title").value;
  const body=document.getElementById("body").value;
  if(title.length<3||body.length<10){alert("Title min 3, Body min 10");return;}
  if(id){
    let p=posts.find(p=>p.id==id);
    p.title=title; p.body=body;
  }else{
    const newId=Math.max(...posts.map(p=>p.id))+1;
    posts.unshift({id:newId,title,body,userId:1});
  }
  showPosts();
}

function editPost(id){
  const post=posts.find(p=>p.id===id);
  showForm(post);
}


renderLogin();
