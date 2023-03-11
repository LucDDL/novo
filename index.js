// Inicializa o IndexedDB
const dbPromise = window.indexedDB.open("miniblog", 1);

dbPromise.onupgradeneeded = (event) => {
  const db = event.target.result;
  if (!db.objectStoreNames.contains("posts")) {
    db.createObjectStore("posts", { keyPath: "id" });
  }
};

// Define as funções para adicionar, recuperar e excluir posts
const addPost = (post) => {
  return new Promise((resolve, reject) => {
    const transaction = dbPromise.result.transaction("posts", "readwrite");
    const store = transaction.objectStore("posts");
    const request = store.add(post);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject();
    };
  });
};

const getPosts = () => {
  return new Promise((resolve, reject) => {
    const transaction = dbPromise.result.transaction("posts", "readonly");
    const store = transaction.objectStore("posts");
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject();
    };
  });
};

const deletePost = (id) => {
  return new Promise((resolve, reject) => {
    const transaction = dbPromise.result.transaction("posts", "readwrite");
    const store = transaction.objectStore("posts");
    const request = store.delete(id);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject();
    };
  });
};

// Função para exibir os posts na página principal
const renderPosts = async () => {
  const posts = await getPosts();
  const postsContainer = document.getElementById("posts-container");
  postsContainer.innerHTML = "";
  for (let post of posts) {
    const postElement = document.createElement("div");
    postElement.classList.add("card", "mb-3");
    const postContent = `
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <p class="title is-4">${post.title}</p>
          </div>
        </div>
        <div class="content">
          ${post.description}
        </div>
      </div>
      <footer class="card-footer">
        <a href="#" class="card-footer-item has-text-danger" data-id="${post.id}" id="delete-post">Excluir</a>
      </footer>
    `;
    postElement.innerHTML = postContent;
    postsContainer.appendChild(postElement);
  }
  // Define as funções de excluir posts
  const deleteButtons = document.querySelectorAll("#delete-post");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      const postId = parseInt(event.target.getAttribute("data-id"));
      await deletePost(postId);
      renderPosts();
    });
  });
};

// Função para criar um novo post
const createPost = async () => {
  const title = prompt("Digite o título do post:");
  const description = prompt("Digite a descrição do post:");
  const post = {
    id: Date.now(),
    title,
    description,
  };
  await addPost(post);
  renderPosts();
};

// Define a função para o botão "Novo post"
const newPostButton = document.getElementById("new-post");
newPostButton.addEventListener("click", (event) => {
  event.preventDefault();
  createPost();
});

// Inicializa a página principal
renderPosts();
