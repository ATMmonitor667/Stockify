"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("general");
  const [visibleArticles, setVisibleArticles] = useState(6);

  useEffect(()=>{
    const fetch = async()=>
    {
      try{
        setLoading(true)
        const api_key = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
        //next check if the Api key is missing
        if(!api_key)
        {
          console.log("The API key is missing and or the Key is invalid")
        }
        else
        {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          const response = await fetch(
            `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`,
            {
              signal: controller.signal,
              headers: {
                Accept: "application/json",
              },
            }
          );
          clearTimeout(timeoutId);
          if (!response.ok) {
            if (response.status == 403) {
              setError("API key is invalid or missing.");
            } else if (response.status == 429) {
              setError("Rate limit exceeded. Please try again later.");
            } else if (response.status == 500) {
              setError("Server error. Please try again later.");
            } else {
              setError("An unknown error occurred. Please try again later.");
            }

          }

          else{
            const data = await response.json();
            

            setNews(data);
            setLoading(False)
          }

        }


      }
      catch(error)
      {

      }
    }
  })

}