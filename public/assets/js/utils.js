export const renderHeader = (headerEl, routes = []) => {
  if (!headerEl) return;

  const currentPath = window.location.pathname;
  const isAction = ({ className = "" }) =>
    className.includes("btn-login") || className.includes("btn-register");

  const buildLink = ({ path, aName, className = "" }) => {
    const isActive = currentPath === path;
    const classes = ["nav-link", className, isActive ? "is-active" : ""]
      .filter(Boolean)
      .join(" ");
    const ariaCurrent = isActive ? ' aria-current="page"' : "";

    return `<a href="${path}" data-link class="${classes}"${ariaCurrent}>${aName}</a>`;
  };

  const mainLinks = routes.filter((route) => !isAction(route)).map(buildLink).join("");
  const actionLinks = routes.filter(isAction).map(buildLink).join("");

  headerEl.innerHTML = `
    <div class="nav-links-main">${mainLinks}</div>
    <div class="nav-links-actions">${actionLinks}</div>
  `;
};

export const renderHeaderLinks = renderHeader;

export const redirectTo = (route, time = 0) =>
  setTimeout(() => (window.location.href = route), time);
