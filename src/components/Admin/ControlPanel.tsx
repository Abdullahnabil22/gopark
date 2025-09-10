import {  useState } from "react";
import {
  getCategories,
  getZones,
  setZoneOpen,
  updateCategory,
  addRushHour,
  addVacation,
  type Category,
  type Zone,
  type Vacation,
  type RushHour,
} from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../ui/Card";
import { getCategoryName } from "../../utils/categoryUtils";
import { Button } from "../ui/Button";
import {  LuPower, LuPowerOff } from "react-icons/lu";
import { useToast } from "../../hooks/useToast";
import AdminAudit from "./AdminAudit";


export default function ControlPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [rateNormal, setRateNormal] = useState<string>("");
  const [rateSpecial, setRateSpecial] = useState<string>("");
  const [rushDay, setRushDay] = useState<number>(-1);
  const [rushFrom, setRushFrom] = useState<string>("07:00");
  const [rushTo, setRushTo] = useState<string>("09:00");
  const [vacName, setVacName] = useState<string>("");
  const [vacFrom, setVacFrom] = useState<string>("");
  const [vacTo, setVacTo] = useState<string>("");
  const queryClient = useQueryClient();
  const { showSuccess, showError, ToastContainer } = useToast();
  const { data: zones, isLoading, isError, error: zonesError } = useQuery<Zone[]>({
    queryKey: ["zones"],
    queryFn: () => getZones(),
  });
  const { data: categories, isError: categoriesError, error: categoriesErrorMsg } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
  const rushHourMutation = useMutation({
    mutationFn: (rushHour: RushHour) => addRushHour(rushHour),
    onSuccess: () => {
      showSuccess("Rush hours added.");
      setRushDay(-1);
    setRushFrom("07:00");
    setRushTo("09:00");
    },
    onError: (err) => {
      showError(err.message);
    },
  });
  const vacationMutation = useMutation({
    mutationFn: (vacation: Vacation) => addVacation(vacation),
    onSuccess: () => {
      showSuccess("Vacation added.");
      setVacName("");
    setVacFrom("");
    setVacTo("");
    },
    onError: (err) => {
      showError(err.message);
    },
  });
  const zoneMutation = useMutation({
    mutationFn: (zone: Zone) => setZoneOpen(zone.id, zone.open),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      showSuccess(`${variables.name} ${!variables.open ? "opened" : "closed"}.`);
    },
    onError: (err) => {
      
      showError(err.message);
    },
  });

  const categoriesMutation = useMutation({
    mutationFn: (category: Category) => updateCategory(category.id, category),
    onSuccess: () => {
      showSuccess("Category rates updated.");
      setSelectedCategory("")
      setRateNormal("");
      setRateSpecial("");
    },
    onError: (err) => {
      showError(err.message);
    },
  });

  function toggleZone(z: Zone) {
    zoneMutation.mutate({ ...z, open: !z.open });
  }

  function saveCategoryRates(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCategory) {
      showError("Please select a category.");
      return;
    }
    if (!rateNormal || !rateSpecial) {
      showError("Please enter both rate normal and rate special.");
      return;
    }
    const normal = Number(parseFloat(rateNormal).toFixed(2));
    const special = Number(parseFloat(rateSpecial).toFixed(2));

    categoriesMutation.mutate({ id: selectedCategory, rateNormal: normal, rateSpecial: special });
  
  }

  function createRush(e: React.FormEvent) {
    e.preventDefault();
    if (rushDay == -1 || !rushFrom || !rushTo) {
      showError("Please enter all rush hours.");
      return;
    }
    rushHourMutation.mutate({ weekDay: rushDay, from: rushFrom, to: rushTo });
    
  }

  function createVacation(e: React.FormEvent) {
    e.preventDefault();
    if (!vacName || !vacFrom || !vacTo) {
      showError("Please enter all vacation details.");
      return;
    }
    vacationMutation.mutate({ name: vacName, from: vacFrom, to: vacTo });
    
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div>
        <h2 className="text-xl font-semibold">Control Panel</h2>
        <p className="text-sm text-gray-500">Zones, category rates, rush hours, vacations</p>
      </div>
      {isError && <div className="text-sm text-red-600">{zonesError.message}</div>}
      {categoriesError && <div className="text-sm text-red-600">{categoriesErrorMsg.message}</div>}

      <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardContent>
          {isLoading && <div className="text-sm text-gray-500">Loading zones...</div>}
        <h3 className="text-lg font-semibold mb-3">Zones</h3>
        <div className="grid grid-cols-1 gap-3">
          {zones?.map((z) => (
            <div key={z.id} className="border rounded p-3 flex justify-between items-center">
              <div className="font-medium">{getCategoryName(z.categoryId!, categories)} {z.name}</div>
              
              <Button className={`h-9 px-3 rounded ${z.open ? "bg-red-600 focus-visible:ring-red-600" : "bg-green-600 focus-visible:ring-green-600"} text-white`} onClick={() => toggleZone(z)} variant="custom">
                {z.open ? <span className="flex items-center gap-2"><LuPowerOff /> <span>
                  Close
                  </span></span>: <span className="flex items-center gap-2"><LuPower /> <span>
                  Open
                  </span></span>}
              </Button>
            </div>
          ))}
        </div>
          </CardContent>
        </Card>
        
     
         <section className="space-y-4">
       <Card>
        <CardContent >
        <h3 className="text-lg font-semibold mb-3">Category Rates</h3>
        <form onSubmit={saveCategoryRates} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">Category</label>
            <select className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)}>
              <option value="">Select a category</option>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">Rate Normal</label>
            <input className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" value={rateNormal} onChange={(e)=>setRateNormal(e.target.value)} placeholder="e.g. 3.00" />
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">Rate Special</label>
            <input className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" value={rateSpecial} onChange={(e)=>setRateSpecial(e.target.value)} placeholder="e.g. 5.00" />
          </div>
          <div>
            <Button  variant="primary"
            size="md"
            className="w-full" >Save</Button>
          </div>
        </form>
        </CardContent>
      </Card>

      <Card >
      <CardContent >
        <h3 className="text-lg font-semibold mb-3">Rush Hours</h3>
        <form onSubmit={createRush} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">Weekday</label>
            <select className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" value={rushDay} onChange={(e)=>setRushDay(parseInt(e.target.value, 10))}>
            <option value="">Select a Day</option>
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">From</label>
            <input type="time" className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" value={rushFrom} onChange={(e)=>setRushFrom(e.target.value)} />
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">To</label>
            <input type="time" className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" value={rushTo} onChange={(e)=>setRushTo(e.target.value)} />
          </div>
          <div>
            <Button  variant="primary"
            size="md"
            className="w-full" >Add Rush Window</Button>
          </div>
        </form>
        </CardContent>
      </Card>

      <Card >
      <CardContent >
        <h3 className="text-lg font-semibold mb-3">Vacations</h3>
        <form onSubmit={createVacation} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">Name</label>
            <input className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" value={vacName} onChange={(e)=>setVacName(e.target.value)} placeholder="Eid" />
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">From</label>
            <input type="date" className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" value={vacFrom} onChange={(e)=>setVacFrom(e.target.value)} />
          </div>
          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">To</label>
            <input type="date" className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500" value={vacTo} onChange={(e)=>setVacTo(e.target.value)} />
          </div>
          <div >
          <Button  variant="primary"
            size="md"
            className="w-full" >Add Vacation</Button>
          </div>
        </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent>

      <AdminAudit/>
        </CardContent>
      </Card>
      </section> 
      </div>
    </div>
  );
}


