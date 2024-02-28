<script setup>
import { useApi } from "@composables/useApi";
import { FilterMatchMode } from "primevue/api";
import { reactive, ref, watch, computed } from "vue";

const appApi = reactive(useApi());

const listMateriales = ref([]);
const formMaterial = reactive({
    id: null,
    clave: "",
    descripcion: "",
    unidad: "pza",
    precio: "",
    cantidad: 0,
    costo: 0,
    status: "instock",
});

const selectedMateriales = ref();
const loading = ref(true);
const submitted = ref(false);

const dt = ref();
const modalMaterial = ref(false);
const modalMaterialCosto = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const statuses = ref([
    { label: "En Stock", value: "instock" },
    { label: "Poco Stock", value: "lowstock" },
    { label: "Sin Stock", value: "outofstock" },
]);

const totalCostoSelectedMateriales = computed(() => {
    return selectedMateriales.value.reduce((total, item) => {
        return total + item.cantidad * item.costo;
    }, 0);
});

const initComponents = () => {
    fetchListMaterial();
};

const fetchListMaterial = async () => {
    listMateriales.value = await appApi.getMaterialList();
    loading.value = false;
};

const formatCurrency = (value) => {
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
    });
};

const showModalNewMaterial = () => {
    resetFormModal();
    submitted.value = false;
    modalMaterial.value = true;
};

const showModalMaterialCosto = () => {
    selectedMateriales.value = JSON.parse(
        JSON.stringify(selectedMateriales.value)
    );
    selectedMateriales.value.forEach((item) => {
        item.cantidad = 1;
    });
    modalMaterialCosto.value = true;
};

const showModalEditMaterial = (item) => {
    formMaterial.id = item.id;
    formMaterial.clave = item.clave;
    formMaterial.descripcion = item.descripcion;
    formMaterial.precio = item.precio;
    formMaterial.cantidad = item.cantidad;
    formMaterial.costo = item.costo;
    formMaterial.unidad = item.unidad;
    formMaterial.status = item.status;
    modalMaterial.value = true;
};

const hideModalMaterial = () => {
    modalMaterial.value = false;
    submitted.value = false;
};

const saveMaterial = async () => {
    submitted.value = true;

    formMaterial.costo = formMaterial.precio / formMaterial.cantidad;

    if (formMaterial.id != null) {
        await appApi.updateMaterial(formMaterial.id, formMaterial);

        listMateriales.value[findIndexById(formMaterial.id)] = {
            ...formMaterial,
        };
    } else {
        formMaterial.id = getNewID();

        await appApi.addMaterial(formMaterial);
        listMateriales.value.push({ ...formMaterial });
    }
    modalMaterial.value = false;
    resetFormModal();
};

const getNewID = () => {
    const materialMayor = listMateriales.value.reduce((previous, current) => {
        return parseInt(current.id) > parseInt(previous.id)
            ? current
            : previous;
    });

    return parseInt(materialMayor.id) + 1;
};

const confirmDeleteMaterial = () => {};

const exportCSV = () => {
    dt.value.exportCSV();
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < listMateriales.value.length; i++) {
        if (listMateriales.value[i].id == id) {
            index = i;
            break;
        }
    }
    return index;
};

const getStatusLabel = (status) => {
    switch (status) {
        case "instock":
            return "success";

        case "lowstock":
            return "warning";

        case "outofstock":
            return "danger";

        default:
            return null;
    }
};

const resetFormModal = () => {
    formMaterial.id = null;
    formMaterial.clave = "";
    formMaterial.descripcion = "";
    formMaterial.precio = 0.0;
    formMaterial.cantidad = 0;
    formMaterial.costo = 0.0;
    formMaterial.unidad = "pza";
    formMaterial.status = "instock";
};

initComponents();
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="flex sm:flex-row flex-column flex-wrap gap-2 justify-content-between">
               
                <span class="p-input-icon-left">
                    <i class="pi pi-search" />
                    <InputText v-model="filters['global'].value"
                                placeholder="Buscar material"  class="w-full"/>
                </span>
               
                <div class="flex sm:flex-row flex-column gap-2">
                    <Button label="Nuevo material"
                            icon="pi pi-plus"
                            severity="success"
                            class=""
                            @click="showModalNewMaterial" />
                    <Button label="Calcular costo"
                            icon="pi pi-calculator"
                            severity="primary"
                            class=""
                            @click="showModalMaterialCosto" />
                    <Button label="Exportar"
                            icon="pi pi-upload"
                            severity="secondary"
                            @click="exportCSV($event)" />
                </div>
            </div>
            <Divider/>
            <DataTable ref="dt"
                       v-model:selection="selectedMateriales"
                       v-model:filters="filters"
                       :value="listMateriales"
                       stripedRows
                       size="small"
                       removableSort
                       :globalFilterFields="[
                    'clave',
                    'descripcion',
                    'precio',
                    'cantidad',
                    'costo',
                ]"
                       :loading="loading"
                       dataKey="id">
                <template #empty> No se encontraron materiales. </template>
                <template #loading> Cargando materiales. </template>
                <Column selectionMode="multiple"
                        headerStyle="width: 1rem"></Column>
                <Column field="clave"
                        sortable
                        header="Material">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.status"
                             :severity="getStatusLabel(slotProps.data.status)" /> <br>
                        <b><small> {{ slotProps.data.clave }}</small></b> <br>
                        <small> {{ slotProps.data.descripcion }}</small><br>
                        <small class="text-primary-600"> {{ formatCurrency(slotProps.data.precio) }} x {{ slotProps.data.cantidad }} {{ slotProps.data.unidad }}</small>
                    </template>
                </Column>
                <Column field="costo"
                        sortable
                        header="Costo">
                    <template #body="slotProps">
                        <div class="text-center"><b class="text-primary">{{ formatCurrency(slotProps.data.costo) }}</b></div>
                        <div class="text-center"><small> c/{{ slotProps.data.unidad }}</small></div>
                    </template>
                </Column>
                <Column :exportable="false"
                        headerStyle="width: 8rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil"
                                outlined
                                rounded
                                class="mr-2 btn-sm"
                                @click="showModalEditMaterial(slotProps.data)" />
                        <Button icon="pi pi-trash"
                                outlined
                                rounded
                                severity="danger"
                                @click="confirmDeleteMaterial(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>

            <Dialog v-model:visible="modalMaterial"
                    :style="{ width: '450px', 'max-width': '90vw' }"
                    header="Material Detalles"
                    :modal="true"
                    class="p-fluid">
                <div class="field">
                    <label for="clave">Clave</label>
                    <InputText id="clave"
                               v-model.trim="formMaterial.clave"
                               required="true"
                               autofocus
                               :class="{ 'p-invalid': submitted && !formMaterial.clave }" />
                    <small class="p-error"
                           v-if="submitted && !formMaterial.clave">Clave es requerida.</small>
                </div>
                <div class="field">
                    <label for="descripcion">Descripcion</label>
                    <Textarea id="descripcion"
                              v-model="formMaterial.descripcion"
                              required="true"
                              rows="3"
                              cols="20" />
                </div>

                <div class="field">
                    <label for="inventoryStatus"
                           class="mb-3">Status Inventario</label>
                    <Dropdown id="inventoryStatus"
                              v-model="formMaterial.status"
                              :options="statuses"
                              optionLabel="label"
                              optionValue="value"
                              placeholder="Seleccionar status">
                        <template #value="slotProps">
                            <div v-if="slotProps.value && slotProps.value.value">
                                <Tag :value="slotProps.value.label"
                                     :severity="getStatusLabel(slotProps.value.value)" />
                            </div>
                            <div v-else-if="slotProps.value && !slotProps.value.value">
                                <Tag :value="slotProps.value"
                                     :severity="getStatusLabel(slotProps.value)" />
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                    </Dropdown>
                </div>
                <div class="field">
                    <label class="mb-3">Unidad de medida</label>
                    <div class="formgrid grid">
                        <div class="field-radiobutton col-6">
                            <RadioButton id="unidad1"
                                         name="unidad"
                                         value="pza"
                                         v-model="formMaterial.unidad" />
                            <label for="unidad1">Pieza</label>
                        </div>
                        <div class="field-radiobutton col-6">
                            <RadioButton id="unidad2"
                                         name="unidad"
                                         value="cm"
                                         v-model="formMaterial.unidad" />
                            <label for="unidad2">Centimetro</label>
                        </div>
                        <div class="field-radiobutton col-6">
                            <RadioButton id="unidad3"
                                         name="unidad"
                                         value="ml"
                                         v-model="formMaterial.unidad" />
                            <label for="unidad3">Mililitro</label>
                        </div>
                        <div class="field-radiobutton col-6">
                            <RadioButton id="unidad4"
                                         name="unidad"
                                         value="gm"
                                         v-model="formMaterial.unidad" />
                            <label for="unidad4">Gramos</label>
                        </div>
                    </div>
                </div>

                <div class="formgrid grid">
                    <div class="field col">
                        <label for="precio">Precio</label>
                        <InputNumber id="precio"
                                     v-model="formMaterial.precio"
                                     required="true"
                                     mode="currency"
                                     currency="MXN"
                                     locale="es-MX" />
                    </div>
                    <div class="field col">
                        <label for="cantidad">Cantidad</label>
                        <InputNumber id="cantidad"
                                     required="true"
                                     v-model="formMaterial.cantidad"
                                     integeronly />
                    </div>
                </div>
                <template #footer>
                    <Button label="Cancelar"
                            icon="pi pi-times"
                            text
                            @click="hideModalMaterial" />
                    <Button label="Guardar"
                            icon="pi pi-check"
                            text
                            @click="saveMaterial()" />
                </template>
            </Dialog>
            <Dialog v-model:visible="modalMaterialCosto"
                    :style="{ width: '600px', 'max-width': '90vw' }"
                    header="Calcular costos"
                    :modal="true"
                    class="p-fluid">

                <DataView :value="selectedMateriales">
                    <template #list="slotProps">
                        <div class="grid grid-nogutter">
                            <div v-for="(item, index) in slotProps.items"
                                 :key="index"
                                 class="col-12">
                                <div class="flex flex-row align-items-center px-1 gap-3"
                                     :class="{ 'border-top-1 surface-border': index !== 0 }">
                                    <div class="flex flex-row justify-content-between align-items-center gap-3 flex-1">
                                        <div class="flex flex-row align-items-center">
                                            <div class="flex flex-column mr-1">
                                                <Button icon="pi pi-angle-up"
                                                        @click="item.cantidad += 1"
                                                        text
                                                        rounded />
                                                <Button icon="pi pi-angle-down"
                                                        @click="item.cantidad -= 1"
                                                        text
                                                        rounded />
                                            </div>
                                            <div class="flex flex-row justify-content-between align-items-start">
                                                <div>
                                                    <b class="text-sm">{{ item.clave }}</b>
                                                    <div class="text-secondary text-sm">{{ item.descripcion }}</div>
                                                    <small class="text-primary">{{ item.cantidad }} {{ item.unidad }} x {{ formatCurrency(item.costo) }} </small>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex flex-column align-items-end">
                                            <span class="text-lg font-semibold text-900 mt-2">{{ formatCurrency(item.costo * item.cantidad) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </DataView>
                <Divider type="dashed" />
                <div class="flex justify-content-between flex-wrap px-2">
                    <div class="flex align-items-center justify-content-center mr-1">
                        <span class="text-lg font-medium text-900">COSTO TOTAL:</span>
                    </div>
                    <div class="flex align-items-center justify-content-center">
                        <span class="text-xl font-semibold text-primary">{{ formatCurrency(totalCostoSelectedMateriales) }}</span>
                    </div>
                </div>

                <template #footer>
                    <Button label="Cerrar"
                            icon="pi pi-times"
                            text
                            @click="modalMaterialCosto = false" />
                </template>
            </Dialog>
        </div>
    </div>
</template>
