import RepsClient from "./RepsClient";
import repsData from "@/data/reps.json";

export default function RepsPage() {
  return <RepsClient reps={repsData} />;
}
