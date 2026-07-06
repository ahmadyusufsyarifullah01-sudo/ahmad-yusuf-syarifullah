#include <iostream>
#include <iomanip>
#include <string>
using namespace std;

// struct untuk menyimpan data satu mahasiswa
struct Mahasiswa
{
    string nim;
    string nama;
    float nilaiAkhir;
    char grade;
    string status;
};

// prototype function, biar bisa dipanggil sebelum definisi lengkapnya di bawah
void menu();
void inputData(Mahasiswa dataMhs[], float nilai[][4], int &jumlahMhs, float bobot[]);
float hitungNilaiAkhir(float tugas, float uts, float uas, float proyek, float bobot[]);
char tentukanGrade(float nilaiAkhir);
string tentukanStatus(float nilaiAkhir);
void tampilSemua(Mahasiswa dataMhs[], float nilai[][4], int jumlahMhs);
void cariMahasiswa(Mahasiswa dataMhs[], float nilai[][4], int jumlahMhs);
void rekapStatistik(Mahasiswa dataMhs[], float nilai[][4], int jumlahMhs);
float inputNilaiValid(string label);
void cetakGarisTabel();

int main()
{
    Mahasiswa dataMahasiswa[50];   // array of structure, maksimal 50 mahasiswa
    float nilai[50][4];            // array 2 dimensi: [i][0]=Tugas [i][1]=UTS [i][2]=UAS [i][3]=Proyek
    float bobot[4] = {0.20, 0.25, 0.35, 0.20}; // bobot masing-masing komponen nilai

    int jumlahMahasiswa = 0; // jumlah mahasiswa yang sudah pernah diinput
    int pilihan;

    // loop menu utama, terus muncul sampai user pilih 5
    do
    {
        menu();
        cout << "Masukkan pilihan (1-5): ";
        cin >> pilihan;

        switch (pilihan)
        {
        case 1:
            inputData(dataMahasiswa, nilai, jumlahMahasiswa, bobot);
            break;
        case 2:
            tampilSemua(dataMahasiswa, nilai, jumlahMahasiswa);
            break;
        case 3:
            cariMahasiswa(dataMahasiswa, nilai, jumlahMahasiswa);
            break;
        case 4:
            rekapStatistik(dataMahasiswa, nilai, jumlahMahasiswa);
            break;
        case 5:
            cout << "\nTerima kasih telah menggunakan program ini.\n";
            break;
        default:
            cout << "\nPilihan tidak valid! Silakan pilih angka 1-5.\n";
        }

    } while (pilihan != 5);

    return 0;
}

// menampilkan menu utama ke layar
void menu()
{
    cout << "\n========================================\n";
    cout << "   SISTEM REKAP NILAI AKHIR MAHASISWA\n";
    cout << "========================================\n";
    cout << "1. Input Data Mahasiswa\n";
    cout << "2. Tampilkan Semua Data\n";
    cout << "3. Cari Mahasiswa Berdasarkan NIM\n";
    cout << "4. Rekap Statistik Kelas\n";
    cout << "5. Keluar\n";
    cout << "========================================\n";
}

// minta satu nilai dari user, ulang terus kalau di luar 0-100
float inputNilaiValid(string label)
{
    float nilaiInput;

    do
    {
        cout << "Masukkan nilai " << label << " (0-100): ";
        cin >> nilaiInput;

        if (nilaiInput < 0 || nilaiInput > 100)
            cout << "Nilai tidak valid! Nilai harus di antara 0-100.\n";

    } while (nilaiInput < 0 || nilaiInput > 100);

    return nilaiInput;
}

// input data mahasiswa sebanyak jumlahMhs, sekaligus hitung nilai akhir, grade, dan status
void inputData(Mahasiswa dataMhs[], float nilai[][4], int &jumlahMhs, float bobot[])
{
    int jumlahInput;

    do
    {
        cout << "\nMasukkan jumlah mahasiswa (1-50): ";
        cin >> jumlahInput;

        if (jumlahInput < 1 || jumlahInput > 50)
            cout << "Jumlah tidak valid! Masukkan angka 1-50.\n";

    } while (jumlahInput < 1 || jumlahInput > 50);

    jumlahMhs = jumlahInput;

    for (int i = 0; i < jumlahMhs; i++)
    {
        cout << "\n--- Data Mahasiswa ke-" << (i + 1) << " ---\n";

        cout << "Masukkan NIM   : ";
        cin >> dataMhs[i].nim;

        cin.ignore(); // buang sisa newline di buffer supaya getline tidak "kelewat"
        cout << "Masukkan Nama  : ";
        getline(cin, dataMhs[i].nama);

        nilai[i][0] = inputNilaiValid("Tugas");
        nilai[i][1] = inputNilaiValid("UTS");
        nilai[i][2] = inputNilaiValid("UAS");
        nilai[i][3] = inputNilaiValid("Proyek");

        dataMhs[i].nilaiAkhir = hitungNilaiAkhir(nilai[i][0], nilai[i][1], nilai[i][2], nilai[i][3], bobot);
        dataMhs[i].grade = tentukanGrade(dataMhs[i].nilaiAkhir);
        dataMhs[i].status = tentukanStatus(dataMhs[i].nilaiAkhir);

        cout << "Data mahasiswa berhasil disimpan.\n";
    }
}

// rumus nilai akhir: 20% Tugas + 25% UTS + 35% UAS + 20% Proyek
float hitungNilaiAkhir(float tugas, float uts, float uas, float proyek, float bobot[])
{
    return (tugas * bobot[0]) + (uts * bobot[1]) + (uas * bobot[2]) + (proyek * bobot[3]);
}

// menentukan huruf grade dari nilai akhir
char tentukanGrade(float nilaiAkhir)
{
    if (nilaiAkhir >= 85)
        return 'A';
    else if (nilaiAkhir >= 75)
        return 'B';
    else if (nilaiAkhir >= 65)
        return 'C';
    else if (nilaiAkhir >= 50)
        return 'D';
    else
        return 'E';
}

// nilai akhir >= 65 dianggap Lulus, selain itu Tidak Lulus
string tentukanStatus(float nilaiAkhir)
{
    if (nilaiAkhir >= 65)
        return "Lulus";
    else
        return "Tidak Lulus";
}

// cetak garis pembatas tabel, dipakai berulang di tampilSemua()
void cetakGarisTabel()
{
    cout << "+-----+------------+----------------------+--------+--------+--------+--------+--------+-------+--------------+\n";
}

// tampilkan seluruh data mahasiswa dalam bentuk tabel
void tampilSemua(Mahasiswa dataMhs[], float nilai[][4], int jumlahMhs)
{
    if (jumlahMhs == 0)
    {
        cout << "\nBelum ada data mahasiswa. Silakan input data terlebih dahulu.\n";
        return;
    }

    cout << "\nDATA SELURUH MAHASISWA\n";
    cetakGarisTabel();
    cout << "| " << left << setw(3) << "No" << " | " << setw(10) << "NIM" << " | " << setw(20) << "Nama"
         << " | " << right << setw(6) << "Tugas" << " | " << setw(6) << "UTS" << " | " << setw(6) << "UAS"
         << " | " << setw(6) << "Proyek" << " | " << setw(6) << "Akhir" << " | " << left << setw(5) << "Grade"
         << " | " << setw(12) << "Status" << " |\n";
    cetakGarisTabel();

    for (int i = 0; i < jumlahMhs; i++)
    {
        cout << "| " << left << setw(3) << (i + 1) << " | " << setw(10) << dataMhs[i].nim << " | " << setw(20) << dataMhs[i].nama
             << " | " << right << fixed << setprecision(2)
             << setw(6) << nilai[i][0] << " | " << setw(6) << nilai[i][1] << " | " << setw(6) << nilai[i][2]
             << " | " << setw(6) << nilai[i][3] << " | " << setw(6) << dataMhs[i].nilaiAkhir
             << " | " << left << setw(5) << dataMhs[i].grade << " | " << setw(12) << dataMhs[i].status << " |\n";
    }

    cetakGarisTabel();
}

// cari mahasiswa berdasarkan NIM, tampilkan detailnya kalau ketemu
void cariMahasiswa(Mahasiswa dataMhs[], float nilai[][4], int jumlahMhs)
{
    if (jumlahMhs == 0)
    {
        cout << "\nBelum ada data mahasiswa. Silakan input data terlebih dahulu.\n";
        return;
    }

    string nimDicari;
    bool ditemukan = false;

    cout << "\nMasukkan NIM yang dicari: ";
    cin >> nimDicari;

    for (int i = 0; i < jumlahMhs; i++)
    {
        if (dataMhs[i].nim == nimDicari)
        {
            ditemukan = true;

            cout << "\n=========== DATA DITEMUKAN ===========\n";
            cout << "NIM          : " << dataMhs[i].nim << "\n";
            cout << "Nama         : " << dataMhs[i].nama << "\n";
            cout << fixed << setprecision(2);
            cout << "Nilai Tugas  : " << nilai[i][0] << "\n";
            cout << "Nilai UTS    : " << nilai[i][1] << "\n";
            cout << "Nilai UAS    : " << nilai[i][2] << "\n";
            cout << "Nilai Proyek : " << nilai[i][3] << "\n";
            cout << "Nilai Akhir  : " << dataMhs[i].nilaiAkhir << "\n";
            cout << "Grade        : " << dataMhs[i].grade << "\n";
            cout << "Status       : " << dataMhs[i].status << "\n";
            cout << "=======================================\n";

            break; // sudah ketemu, tidak perlu lanjut looping
        }
    }

    if (!ditemukan)
        cout << "\nData tidak ditemukan.\n";
}

// hitung dan tampilkan statistik seluruh kelas
void rekapStatistik(Mahasiswa dataMhs[], float nilai[][4], int jumlahMhs)
{
    if (jumlahMhs == 0)
    {
        cout << "\nBelum ada data mahasiswa. Silakan input data terlebih dahulu.\n";
        return;
    }

    float totalNilaiAkhir = 0;
    float totalTugas = 0, totalUTS = 0, totalUAS = 0, totalProyek = 0;
    float nilaiTertinggi = dataMhs[0].nilaiAkhir;
    float nilaiTerendah = dataMhs[0].nilaiAkhir;
    int jumlahLulus = 0, jumlahTidakLulus = 0;

    // array 1 dimensi untuk menampung jumlah tiap grade: indeks 0=A, 1=B, 2=C, 3=D, 4=E
    int jumlahGrade[5] = {0, 0, 0, 0, 0};

    for (int i = 0; i < jumlahMhs; i++)
    {
        totalNilaiAkhir += dataMhs[i].nilaiAkhir;
        totalTugas += nilai[i][0];
        totalUTS += nilai[i][1];
        totalUAS += nilai[i][2];
        totalProyek += nilai[i][3];

        if (dataMhs[i].nilaiAkhir > nilaiTertinggi)
            nilaiTertinggi = dataMhs[i].nilaiAkhir;

        if (dataMhs[i].nilaiAkhir < nilaiTerendah)
            nilaiTerendah = dataMhs[i].nilaiAkhir;

        if (dataMhs[i].status == "Lulus")
            jumlahLulus++;
        else
            jumlahTidakLulus++;

        switch (dataMhs[i].grade)
        {
        case 'A': jumlahGrade[0]++; break;
        case 'B': jumlahGrade[1]++; break;
        case 'C': jumlahGrade[2]++; break;
        case 'D': jumlahGrade[3]++; break;
        case 'E': jumlahGrade[4]++; break;
        }
    }

    float rataRataAkhir = totalNilaiAkhir / jumlahMhs;
    float rataRataTugas = totalTugas / jumlahMhs;
    float rataRataUTS = totalUTS / jumlahMhs;
    float rataRataUAS = totalUAS / jumlahMhs;
    float rataRataProyek = totalProyek / jumlahMhs;

    cout << "\n================ REKAP STATISTIK KELAS ================\n";
    cout << fixed << setprecision(2);
    cout << "Jumlah Mahasiswa       : " << jumlahMhs << "\n";
    cout << "Rata-rata Nilai Akhir  : " << rataRataAkhir << "\n";
    cout << "Nilai Tertinggi        : " << nilaiTertinggi << "\n";
    cout << "Nilai Terendah         : " << nilaiTerendah << "\n";
    cout << "Jumlah Lulus           : " << jumlahLulus << "\n";
    cout << "Jumlah Tidak Lulus     : " << jumlahTidakLulus << "\n";
    cout << "---------------------------------------------------------\n";
    cout << "Jumlah Grade A         : " << jumlahGrade[0] << "\n";
    cout << "Jumlah Grade B         : " << jumlahGrade[1] << "\n";
    cout << "Jumlah Grade C         : " << jumlahGrade[2] << "\n";
    cout << "Jumlah Grade D         : " << jumlahGrade[3] << "\n";
    cout << "Jumlah Grade E         : " << jumlahGrade[4] << "\n";
    cout << "---------------------------------------------------------\n";
    cout << "Rata-rata Nilai Tugas  : " << rataRataTugas << "\n";
    cout << "Rata-rata Nilai UTS    : " << rataRataUTS << "\n";
    cout << "Rata-rata Nilai UAS    : " << rataRataUAS << "\n";
    cout << "Rata-rata Nilai Proyek : " << rataRataProyek << "\n";
    cout << "=========================================================\n";
}
