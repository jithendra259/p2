import UserInfo from "@/components/UserInfo";
import Header from "@/components/header";
import AQIBoard from "@/components/aqiboard";
import Ranking from "@/components/ranking";

export default function Dashboard() {
  return(
    <div className="container">
      <Header/>
      <AQIBoard/>
      <Ranking/>
      <UserInfo/>
    </div>
  )
}
