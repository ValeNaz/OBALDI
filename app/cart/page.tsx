import { redirect } from "next/navigation";

const CartRedirect = () => {
  redirect("/checkout");
};

export default CartRedirect;
