export function setupCompanyActions({
  companyData,
  canDeleteCompany,
}) {
  if (canDeleteCompany) {
    document.getElementById("btn-delete")?.addEventListener("click", () => {
      console.log("DELETE company", companyData.id);
    });
  }
}
