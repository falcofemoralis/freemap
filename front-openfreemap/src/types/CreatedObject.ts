import EditType from '@/constants/EditType';

export default interface CreatedObject{
  type: EditType
  name: string | null
  coordinates: number[][][]
}