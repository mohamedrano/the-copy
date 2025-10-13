import CharacterNode from '../CharacterNode';

export default function CharacterNodeExample() {
  return (
    <div className="p-8 bg-background flex gap-4">
      <CharacterNode name="أحمد السعيد" role="البطل" intensity={80} />
      <CharacterNode name="فاطمة" role="البطلة المساعدة" intensity={50} />
      <CharacterNode name="محمود" role="الخصم" intensity={30} />
    </div>
  );
}
