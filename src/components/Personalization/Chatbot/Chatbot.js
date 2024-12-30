import React, { useState, useEffect } from "react";

const Chatbot = () => {
    const [isDiamondMember, setIsDiamondMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkMembership = async () => {
            try {
                const userId = localStorage.getItem("id");

                if (!userId) {
                    throw new Error("Please log in to check your membership status.");
                }

                const membershipResponse = await fetch(
                    `http://localhost:2811/pay/current-plan?userId=${userId}`
                );
                if (!membershipResponse.ok) {
                    throw new Error("Failed to verify membership status.");
                }

                const membershipData = await membershipResponse.json();

                if (membershipData.isDiamondMember) {
                    setIsDiamondMember(true);
                } else {
                    throw new Error("Access restricted. Only Diamond members can access this chatbot.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        checkMembership();
    }, []);

    useEffect(() => {
        if (isDiamondMember) {
            const chatbotConfigScript = document.createElement("script");
            chatbotConfigScript.innerHTML = `
                window.embeddedChatbotConfig = {
                    chatbotId: "SSomlHGVOX6UsUUfpcDjl",
                    domain: "www.chatbase.co"
                }
            `;
            document.body.appendChild(chatbotConfigScript);

            const chatbotEmbedScript = document.createElement("script");
            chatbotEmbedScript.src = "https://www.chatbase.co/embed.min.js";
            chatbotEmbedScript.setAttribute("chatbotId", "SSomlHGVOX6UsUUfpcDjl");
            chatbotEmbedScript.setAttribute("domain", "www.chatbase.co");
            chatbotEmbedScript.defer = true;
            document.body.appendChild(chatbotEmbedScript);

            return () => {
                document.body.removeChild(chatbotConfigScript);
                document.body.removeChild(chatbotEmbedScript);
            };
        }
    }, [isDiamondMember]);

    if (loading) {
        return <></>;
    }

    if (error) {
        return <></>;
    }

    if (!isDiamondMember) {
        return <></>;
    }

    return (
        <></>
    );
};

export default Chatbot;
