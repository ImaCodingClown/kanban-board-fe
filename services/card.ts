export const addCard = async (cardData: {
  title: string;
  description?: string;
  columnTitle: string;
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

  return await response.json();
};
