import {
  cancelTicketOrder,
  createEntradaForTicket,
  createTicketOrder,
  payTicketOrder,
} from "../../fetch/purchase.fetch.js";
import { redirectTo } from "../../utils.js";

export function createPurchaseController({
  state,
  elements,
  renderers,
  loadEvents,
}) {
  const { purchaseQuantityInput, purchaseSubmitButton } = elements;

  async function purchaseSelectedEvent() {
    if (!state.selectedEvent) return;
    if (!state.user) {
      renderers.closePurchaseModal();
      redirectTo("/login");
      return;
    }

    const quantity = Number(purchaseQuantityInput.value || 0);
    const available = Number(state.selectedEvent.remaining_capacity || 0);
    const unitPrice = Number(state.selectedEvent.price || 0);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      renderers.setPurchaseMessage("La cantidad debe ser mayor que 0.", "error");
      return;
    }

    if (quantity > available) {
      renderers.setPurchaseMessage(
        `Solo hay ${available} entrada(s) disponible(s).`,
        "error",
      );
      return;
    }

    purchaseSubmitButton.disabled = true;
    renderers.setPurchaseMessage("Procesando compra...", "");

    const createTicketResult = await createTicketOrder(state.selectedEvent.id);
    if (!createTicketResult.ok) {
      purchaseSubmitButton.disabled = false;

      if (createTicketResult.status === 401) {
        renderers.closePurchaseModal();
        redirectTo("/login");
        return;
      }

      renderers.setPurchaseMessage(
        createTicketResult.message || "No se pudo crear el ticket.",
        "error",
      );
      return;
    }

    const ticketId = Number(createTicketResult.data?.id_ticket || 0);
    if (ticketId <= 0) {
      purchaseSubmitButton.disabled = false;
      renderers.setPurchaseMessage("Ticket inválido devuelto por servidor.", "error");
      return;
    }

    let createdCount = 0;
    for (let i = 0; i < quantity; i += 1) {
      const entradaResult = await createEntradaForTicket({
        idEvento: state.selectedEvent.id,
        idTicket: ticketId,
        precioPagado: unitPrice,
      });

      if (!entradaResult.ok) {
        break;
      }

      createdCount += 1;
    }

    if (createdCount === 0) {
      await cancelTicketOrder(ticketId);
      purchaseSubmitButton.disabled = false;
      renderers.setPurchaseMessage("No se pudo generar ninguna entrada.", "error");
      return;
    }

    const totalPagado = Number((createdCount * unitPrice).toFixed(2));
    const payResult = await payTicketOrder(ticketId, totalPagado);

    if (!payResult.ok) {
      purchaseSubmitButton.disabled = false;
      renderers.setPurchaseMessage(
        `Se generaron ${createdCount} entrada(s), pero no se pudo cerrar el pago del ticket.`,
        "error",
      );
      await loadEvents();
      return;
    }

    const deliveryWarning = payResult.data?.delivery_warning;
    if (deliveryWarning) {
      renderers.setPurchaseMessage(
        `Compra completada: ${createdCount} entrada(s) en ticket #${ticketId}. No se pudo enviar el email (${deliveryWarning}).`,
        "error",
      );
    } else {
      renderers.setPurchaseMessage(
        `Compra completada: ${createdCount} entrada(s) en ticket #${ticketId}. PDF enviado por email.`,
        "success",
      );
    }

    await loadEvents();
    purchaseSubmitButton.disabled = false;

    setTimeout(() => {
      renderers.closePurchaseModal();
    }, 900);
  }

  return {
    purchaseSelectedEvent,
  };
}
