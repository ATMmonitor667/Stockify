import supabase from "./config/supabaseClient";

export const tester = async () => {
  const { data, error } = await supabase
    .from("Stockify")
    .select("*")
    if (error) {
      console.log(error);
    }
    if (data) {
      console.log(data);
    }

}