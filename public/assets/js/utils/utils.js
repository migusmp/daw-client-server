export const isEmpty = (str) => !str || str.trim().length === 0;

export const renderMessage = (container, msg, type = "error") => {
    container.innerHTML = "";
    const p = document.createElement("p");
    p.className = `alert alert--${type}`;
    p.textContent = msg;
    container.appendChild(p);
};

export const createMessageErrorToDiv = (divToAppendMessage, msg, type = "error") => {
    renderMessage(divToAppendMessage, msg, type);
};

export const redirectTo = (path, delayMs = 0) => {
  if (delayMs > 0) {
    setTimeout(() => window.location.assign(path), delayMs);
  } else {
    window.location.assign(path);
  }
}