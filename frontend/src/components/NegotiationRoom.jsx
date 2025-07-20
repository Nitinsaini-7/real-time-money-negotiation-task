// src/components/NegotiationRoom.js (simplified)
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  auth: { token: localStorage.getItem("token") },
}); // Connect to your backend

function NegotiationRoom({ sessionId, userId, username }) {
  const [offers, setOffers] = useState([]);
  const [newOfferAmount, setNewOfferAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.emit("joinSession", { sessionId, userId });

    socket.on("currentOffers", (initialOffers) => {
      setOffers(initialOffers);
    });

    socket.on("offerUpdate", (updatedOffers) => {
      setOffers(updatedOffers);
    });

    socket.on("negotiationEnded", ({ acceptedOffer, byUser }) => {
      setMessage(
        `Negotiation ended! Offer of $${acceptedOffer.offerAmount} was accepted by ${byUser}.`
      );
      // You might want to disable further offers or redirect
    });

    return () => {
      socket.off("currentOffers");
      socket.off("offerUpdate");
      socket.off("negotiationEnded");
    };
  }, [sessionId, userId]);

  const handleSendOffer = () => {
    if (newOfferAmount) {
      socket.emit("newOffer", {
        sessionId,
        offerAmount: parseFloat(newOfferAmount),
        userId,
      });
      setNewOfferAmount("");
    }
  };

  const handleAccept = (offerId) => {
    socket.emit("acceptOffer", { sessionId, offerId, userId });
    toast.success("acceptOffer");
  };

  const handleDecline = (offerId) => {
    socket.emit("declineOffer", { sessionId, offerId, userId });
    toast.success("declineOffer");
  };

  return (
    <div className="p-4  mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-center">
        Negotiation Session: {sessionId}
      </h2>
      <p className="text-center text-xl font-semibold">
        Hii, <span className=" text-blue-500">{username}</span>
      </p>

      {message && (
        <p className="text-green-600 font-bold text-center">{message}</p>
      )}

      <div className=" flex justify-center">
        <div
          className="
         flex space-x-4"
        >
          <input
            type="number"
            value={newOfferAmount}
            onChange={(e) => setNewOfferAmount(e.target.value)}
            placeholder="Enter your offer"
            className="flex-grow p-2 px-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendOffer}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Send Offer
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Offers:</h3>
        {offers.length === 0 ? (
          <div className="grid md:grid-cols-3 gap-5">
            <div role="status" class="max-w-sm animate-pulse">
              <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
              <span className="sr-only">Loading...</span>
            </div>
            <div role="status" class="max-w-sm animate-pulse">
              <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
              <span className="sr-only">Loading...</span>
            </div>
            <div role="status" class="max-w-sm animate-pulse">
              <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <ul className=" grid md:grid-cols-3 gap-5">
            {offers.map((offer) => (
              <li
                key={offer._id}
                className="p-3 border rounded-lg shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-lg text-gray-600 font-medium">
                    Offer:{" "}
                    <span className=" text-blue-500">${offer.offerAmount}</span>
                  </p>
                  <p className="text-gray-600 font-semibold">
                    By:{" "}
                    <span className=" text-blue-500">
                      {offer.offeredBy._id === userId
                        ? "You"
                        : ` ${offer.offeredBy.username}`}
                    </span>
                  </p>
                  <p className=" font-semibold text-gray-600">
                    Time:{" "}
                    <span className=" font-extralight">
                      {new Date(offer.timestamp).toLocaleString()}
                    </span>
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      offer.status === "accepted"
                        ? "text-green-600"
                        : offer.status === "declined"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    Status:{" "}
                    {offer.status.charAt(0).toUpperCase() +
                      offer.status.slice(1)}
                  </p>
                </div>
                {offer.offeredBy !== userId && offer.status === "pending" && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleAccept(offer._id)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(offer._id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NegotiationRoom;
