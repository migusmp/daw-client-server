<?php

enum TicketOrderState: string
{
    case PENDING = 'PENDIENTE';
    case PAID = 'PAGADO';
    case CANCELED = 'CANCELADO';
}
