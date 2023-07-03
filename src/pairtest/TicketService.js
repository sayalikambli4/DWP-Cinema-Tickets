import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    // Validating the ticket purchase requests
    const isValidPurchaseRequest = this.isValidPurchase(ticketTypeRequests);

    if (!isValidPurchaseRequest) {
      throw new InvalidPurchaseException(
        "Rejecting this as this is an invalid ticket purchase request"
      );
    }

    let totalTicketPrice = 0;
    let totalSeatsToReserve = 0;

    // Calculating total price of tickets and total seats to reserve
    for (var r of ticketTypeRequests) {
      const ticketType = r.getTicketType();
      const ticketQuantity = r.getNoOfTickets();

      totalTicketPrice += this.getPrice(ticketType) * ticketQuantity;

      //Because Infants do not get any seats
      if (ticketType !== "INFANT") {
        totalSeatsToReserve += ticketQuantity;
      }
    }
    console.log("Total ticket price is = £", totalTicketPrice);
    console.log("Total seats reserved are =", totalSeatsToReserve);

    // Making the  payment request to TicketPaymentService
    let makePaymentRequest = new TicketPaymentService();
    makePaymentRequest.makePayment(accountId, totalTicketPrice);

    // Making seat reservation request to SeatReservationService
    var makeSeatReserve = new SeatReservationService();
    makeSeatReserve.reserveSeat(accountId, totalSeatsToReserve);

    //Assuming both services succeeded
    console.log("Tickets were purchased successfully!!!");
  }

  isValidPurchase(ticketTypeRequests) {
    let totalQuantity = 0;
    let hasAdult = false;

    for (let req of ticketTypeRequests) {
      const ticketType = req.getTicketType();
      const ticketQuantity = req.getNoOfTickets();

      //If single ticket quantity is more than 20 or less than 1, Reject it
      if (ticketQuantity <= 0 || ticketQuantity > 20) {
        return false;
      }

      if (ticketType === "ADULT") {
        hasAdult = true;
      }
      // if total ticket quantity exceeds 20 reject it
      totalQuantity += ticketQuantity;
      if (totalQuantity > 20) {
        return false;
      }
    }

    //All other conditions passed so valid purchase request if adult is there
    return hasAdult;
  }

  // This will return the ticket price based on ticket type
  getPrice(ticketType) {
    switch (ticketType) {
      case "INFANT":
        return 0;
      case "CHILD":
        return 10;
      case "ADULT":
        return 20;
      default:
        throw new InvalidPurchaseException(
          "Rejecting this as this is an invalid ticket type"
        );
    }
  }
}
//some of the Test cases to try
let tService = new TicketService();

let ticketTypeRequest = new TicketTypeRequest("INFANT", 3);
//tService.purchaseTickets(30, ticketTypeRequest);

ticketTypeRequest = new TicketTypeRequest("ADULT", 5);
tService.purchaseTickets(30, ticketTypeRequest);

// tService.purchaseTickets(
//   30,
//   new TicketTypeRequest("CHILD", 1),
//   new TicketTypeRequest("ADULT", 5),
//   new TicketTypeRequest("INFANT", 1)
// );
