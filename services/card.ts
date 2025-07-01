export const addCard = async (cardData: {
  title: string;
  description?: string;
  columnId: string;
}) => {
  const response = await fetch("/api/cards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cardData),
  });

  if (!response.ok) {
    throw new Error("Failed to add card");
  }

  return await response.json(); // expected to return the created CardModel
};
